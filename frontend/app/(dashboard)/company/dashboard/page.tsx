// app/(super-admin)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { GitBranch, Plus, Search,Building2, PlusIcon } from "lucide-react";


import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { loadCompanyDashboardData, loadSuperAdminDashboardData } from "@/services/super-admin.service";
import { StatCard } from "@/components/dashboard/DashboardComponents";
import toast from "react-hot-toast";
import BranchModal from "@/components/branch/branch-modal";
import { createBranch, deleteBranch, getBranches, updateBranch } from "@/services/company.service";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PrimaryButton from "@/components/common/PrimaryButton";
import BranchCard from "@/components/common/BranchCard";
import { BranchCardSkeleton, Skeleton } from "@/components/common/Skeleton";

import { clearActiveBranch, setActiveBranch } from "@/store/slices/branchSlice";

// ── Types ──────────────────────────────────────────────────────────────
interface Company { _id: string; companyName: string; }
interface Branch {
  _id: string;
  branchName: string;
  branchOwnerName: string;
  location: string;
  city: any;
  state: any;
  mobileNumber: string;
  email: string;
  status?: boolean;
  companyId?: string;
}


const defaultForm = {
  branchOwnerName: "",
  branchName: "",
  location: "",
  city: "",
  state: "",
  mobileNumber: "",
  email: "",
  password: "",
  status: true,
}

// ── Page ───────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {

  const dispatch = useDispatch();


  const [userName, setUserName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState("");
  // const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);


  const selectedBranch = useSelector(
    (state:RootState) => state.branch.activeBranch
  )



  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();


  const user = useSelector(
    (state: RootState) => state.auth.user
  );

  const companyId = user?.companyId;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(defaultForm);

  // ── Fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        if(!companyId) return;    

        const res = await loadCompanyDashboardData(companyId);
        const d = res?.data?.data ?? {};
        setBranches(d.branches ?? []);

        console.log('Branches : ', d.branches);
        
      } catch (err) {
        console.error("[Dashboard] fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [companyId]);

  // ── Cookie ─────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = Cookies.get("user");
      if (raw) { const u = JSON.parse(raw); setUserName(u?.name || u?.email || "Admin"); }
    } catch { /* ignore */ }
  }, []);

  // ── Derived ────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const filtered = branches.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.branchName?.toLowerCase().includes(q) ||
      b.branchOwnerName?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q) ||
      b.location?.toLowerCase().includes(q)
    );
  });

  const handleSwitchBranch = (branch: Branch) => {
    localStorage.setItem("activeBranch", JSON.stringify(branch));
    // setSelectedBranch(branch)
    dispatch(setActiveBranch(branch))


    alert('Branch Swicth')


    Cookies.set(
      "active_branch_id",branch._id, {expires: 7}
    )

    router.push('/branch/dashboard');
    router.refresh();
  }

  // ── Handlers ───────────────────────────────────────────────────────
  const handleCreate = () => {
    // setSelectedBranch(null);
    dispatch(clearActiveBranch());
    setOpen(true);
  };

  useEffect(()=>{
    const branch = localStorage.getItem("activeBranch");

    if (branch) {
      // setSelectedBranch(JSON.parse(branch))
      dispatch(setActiveBranch(JSON.parse(branch)))
    }
  }, [dispatch])

  const confirmDelete = async () => {

    if (!selectedBranch) return;

    try {

      const response = await deleteBranch(
        selectedBranch._id
      );

      toast.success(response.data.message);

      setBranches(prev =>
        prev.filter(
          (item: any) =>
            item._id !== selectedBranch._id
        )
      );

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message ||
        "Failed to delete company"
      );

    } finally {

      setConfirmOpen(false);
      // setSelectedBranch(null);
      dispatch(clearActiveBranch());

    }
  };


  const handleSubmit = async () => {
    if (!form.branchName.trim() || !form.branchOwnerName.trim()) {
      toast.error("Branch name and owner name are required");
      return;
    }
    try {
      await createBranch({ ...form, companyId });
      toast.success("Branch added successfully");
      setOpen(false);
      // setSelectedBranch(null);
      dispatch(clearActiveBranch());
      setForm(defaultForm);
      const res = await loadCompanyDashboardData(companyId);
      const d = res?.data?.data ?? {};
      setBranches(d.branches ?? []);
      
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Operation failed");
    }
  };


  return (
    <div className="space-y-7 pb-10">

      {/* ── Greeting ── */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, {userName} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here's a snapshot of your SaaS platform today.</p>
        </div>
        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      {/* ── Stat card ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {loading ? (
          <Skeleton className="h-28" />
        ) : (
          <StatCard
            label="Branches"
            value={branches.length.toLocaleString("en-IN")}
            sub={`Across ${companies.length} ${companies.length === 1 ? "company" : "companies"}`}
            icon={<GitBranch size={20} />}
            accent="cyan"
          />
        )}
      </div>

      {/* ── Branches section ── */}
      <div className="space-y-4">

        {/* Section header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-bold text-slate-800">Branches</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "branch" : "branches"} registered`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search branches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 placeholder:text-slate-400 w-52 transition-all"
              />
            </div>

            {/* Add button */}
            {/* <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] text-white text-sm font-semibold transition-all shadow-sm shadow-emerald-100"
            >
              <Plus size={15} />
              Add Branch
            </button> */}
            <PrimaryButton
              title="Add Branch"
              icon={<Plus size={15}/>}
              onClick={handleCreate}
            />
          </div>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <BranchCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-3">
              <Building2 size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {search ? "No branches match your search." : "No branches added yet."}
            </p>
            {!search && (
              <PrimaryButton
                onClick={handleCreate}
                title="Add Branch"
                icon={<PlusIcon size={13}/>}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((branch) => (
              <BranchCard
                key={branch._id}
                branch={branch}
                onClick={handleSwitchBranch}
              />
            ))}
          </div>

        )}

        <BranchModal
          open={open}
          mode='create'
          form={form}
          setForm={setForm}
          onClose={() => {
            setOpen(false); 
            // setSelectedBranch(null);
            dispatch(clearActiveBranch())
             setForm({
              branchOwnerName: "",
              branchName: "",
              location: "",
              city: "",
              state: "",
              mobileNumber: "",
              email: "",
              password: "",
              status: true,
            });
          }}
          onSubmit={handleSubmit}
        />
        <ConfirmDialog
          open={confirmOpen}
          title="Delete Branch"
          message={`Are you sure you want to delete ${selectedBranch?.branchName || ""
            }?`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => {
            setConfirmOpen(false);
            // setSelectedBranch(null);
            dispatch(clearActiveBranch());
          }}
        />

      </div>
    </div>
  );
}