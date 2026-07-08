"use client";

import { Bell, Search, UserCircle2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBranches } from "@/services/company.service";
import { getUnreadNotificationCount } from "@/services/notification.service";
import Cookies from "js-cookie";
import { setActiveBranch, clearActiveBranch } from "@/store/slices/branchSlice";
import LoginAs from "../common/LoginAs";
import { getSocket, disconnectSocket } from "@/lib/socket";
import toast from "react-hot-toast";

interface Branch {
  _id: string;
  branchName: string;
}

export default function Header() {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;
  const router = useRouter();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const dispatch = useDispatch();
  const activeBranch = useSelector((state: RootState) => state.branch.activeBranch);

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const res = await getBranches();
      const data = res?.data?.data || [];
      setBranches(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadNotificationCount();
      setUnreadCount(res?.data?.count || 0);

      console.log('unread count : ', res);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!role) return;
    if (role === "COMPANY_ADMIN") {
      fetchBranches();
    }
  }, [role]);

  useEffect(() => {
    try {
      const branch = localStorage.getItem("activeBranch");
      if (branch) {
        dispatch(setActiveBranch(JSON.parse(branch)));
      }
    } catch {
      // ignore
    }
  }, [dispatch]);

  // ── Fetch initial unread count + connect socket ──
  useEffect(() => {
    // Only relevant for branch-level roles (BRANCH_MANAGER, or COMPANY_ADMIN inside a branch)
    const socketBranchId =
      activeBranch?._id ||
      Cookies.get("active_branch_id") ||
      user?.branchId?._id ||
      user?.branchId;
    const isBranchContext =
      role === "BRANCH_MANAGER" ||
      role === "EMPLOYEE" ||
      (role === "COMPANY_ADMIN" && socketBranchId);

    if (!isBranchContext) return;

    fetchUnreadCount();

    if (role !== "EMPLOYEE" && !socketBranchId) return;

    const socket = getSocket(socketBranchId || undefined);
    socket.connect();

    const joinBranchRooms = () => {
      if (!socketBranchId) return;

      console.log("joining notification room:", socketBranchId);
      socket.emit("branch:join", socketBranchId);
    };

    socket.on("connect", () => {
      console.log("socket connected :", socket.id);
      joinBranchRooms();
    })

    if (socket.connected) {
      joinBranchRooms();
    }


    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection failed:", err.message);
    })

    socket.on("notification:new", (notification) => {

      console.log("Notificatin received !!"); 
      setUnreadCount((prev) => prev + 1);
      toast.success(notification.title || "New notification");
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("notification:new");
      disconnectSocket();
    };
  }, [role, activeBranch, user?.branchId]);

  const handleSwitchBranch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value;
    const branch = branches.find((b) => b._id === branchId);
    if (!branch) return;

    localStorage.setItem("activeBranch", JSON.stringify(branch));
    Cookies.set("active_branch_id", branch._id, { expires: 7 });
    dispatch(setActiveBranch(branch));
    router.push("/branch/dashboard");
  };

  const handleExitBranch = () => {
    localStorage.removeItem("activeBranch");
    Cookies.remove("active_branch_id");
    dispatch(clearActiveBranch());
    router.push("/company/dashboard");
  };

  const rolesLabel: Record<string, string> = {
    SUPER_ADMIN: "Administration",
    BRANCH_MANAGER: "Branch Manager",
    COMPANY_ADMIN: "Company Administration",
    EMPLOYEE: "Employee",
  };

  return (
    <>
      {activeBranch && user && (
        <LoginAs
          adminName={user.name}
          userName={activeBranch.branchName}
          role="Branch Manager"
          onExit={handleExitBranch}
        />
      )}
      <header className="h-16 bg-white backdrop-blur border-b border-slate-200 flex items-center justify-between px-6">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="placeholder:text-slate-500 w-72 h-10 pl-10 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">
          {user?.role === "COMPANY_ADMIN" && activeBranch && branches.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                disabled={loadingBranches}
                value={activeBranch?._id || ""}
                onChange={handleSwitchBranch}
                className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bell with unread badge */}
          <button
            onClick={() => router.push("/notifications")}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <Bell size={20} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3">
            <UserCircle2 size={36} className="text-emerald-600" />
            <div>
              <h4 className="text-sm font-semibold text-slate-800">{user?.name || "User"}</h4>
              <p className="text-xs text-slate-500">{rolesLabel[user?.role] || "Member"}</p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
