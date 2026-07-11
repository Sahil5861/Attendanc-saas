"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Lock,
  Crown,
  Sparkles,
  ArrowRight,
  X,
  ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { sidebarItems } from "@/components/navigation/sidebar-items";
import { logout } from "@/lib/auth";
import { clearActiveBranch } from "@/store/slices/branchSlice";

export default function Sidebar() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const activeBranch = useSelector((state: RootState) => state.branch.activeBranch);
  const user = useSelector((state: RootState) => state.auth.user);
  const collapsed = useSelector((state:RootState) => state.layout.sidebarCollapsed);

  // const collapsed = false;
  const role = user?.role;

  console.log("activeBranch : ", activeBranch);

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedFeatureTitle, setLockedFeatureTitle] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    logout();
    if (activeBranch) {
      dispatch(clearActiveBranch());
    }
    router.push("/login");
  };

  let effectiveRole = "";
  try {
    effectiveRole =
      role === "COMPANY_ADMIN" && activeBranch ? "BRANCH_MANAGER" : role || "";
  } catch (error) {
    console.error(error);
    effectiveRole = "";
  }

  const activePlan = activeBranch?.plan?.plan_id;
  const btnTitle = activePlan?.name ? "Upgrade Plan" : "Buy Plan";
  const modalTitle = activePlan?.name
    ? "Upgrade your plan to unlock this feature"
    : "Buy a plan to unlock this feature";
  const modalSub = activePlan?.name
    ? "This is not included in your current plan. Upgrade to a plan that includes it."
    : "You don't have any active plan. Buy a plan to unlock this feature.";

  const hasPlanAccess = (slug: string) => {
    return activePlan?.features?.some(
      (feature: any) => feature?.feature_id?.slug === slug
    );
  };

  // items array for the current role — new structure is { ROLE: [...] }
  const items = (sidebarItems as any)[effectiveRole] || [];

  const canShow = (item: any) =>
    !item.permission || permissions.includes(item.permission);

  const handleLockedClick = (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    setLockedFeatureTitle(title);
    setShowUpgradeModal(true);
  };

  const handleUpgradeClick = () => {
    setShowUpgradeModal(false);
    router.push("/branch/plans");
  };

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Renders a single link — locked (plan-gated) or normal
  const renderLink = (item: any) => {
    const Icon = item.icon;
    const isActive = pathname.startsWith(item.href);
    const locked = item.hasAccess ? !hasPlanAccess(item.hasAccess) : false;

    if (locked) {
      return (
        <div
          key={item.href}
          onClick={(e) => handleLockedClick(e, item.title)}
          className="sidebar-item opacity-50 cursor-pointer select-none"
          title="Upgrade your plan to unlock this feature"
        >
          <Icon size={18} />
          {item.title}
          <Lock size={14} className="ml-auto" />
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`sidebar-item ${isActive ? "active" : ""}`}
      >
        <Icon size={18} />
        {item.title}
      </Link>
    );
  };

  return (
    <aside className={`sidebar-bg ${collapsed ? "w-0" : "w-72"} h-screen shrink-0 p-5 ${ collapsed  ? "px-0" : ''} flex flex-col overflow-y-auto transition-all duration-300 ease-in-out`}>
      <div>
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Attendance</h1>
          <p className="text-emerald-400">SaaS</p>
        </div>

        <div className="flex-1
    overflow-y-auto
    overflow-x-hidden
    pr-1
    space-y-1
    scrollbar-thin
    scrollbar-thumb-slate-600
    scrollbar-track-transparent" style={{maxHeight: '70vh', overflowY: 'auto'}}>
          {items.map((item: any) => {
            // ── Group with children (Organization, Employees, Payroll...) ──
            if (item.children) {
              const visibleChildren = item.children.filter(canShow);
              if (visibleChildren.length === 0) return null;

              const groupKey = item.title;
              const hasActiveChild = visibleChildren.some((child: any) =>
                pathname.startsWith(child.href)
              );
              const isOpen = openGroups[groupKey] ?? hasActiveChild;
              // const isOpen = true;
              const GroupIcon = item.icon;

              return (
                <div key={groupKey} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupKey)}
                    className="flex items-center w-full gap-3 px-4 py-2 text-sm font-semibold text-white transition"
                  >
                    <GroupIcon size={16} />
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                    <div className="ml-2 mt-1 space-y-1 border-l border-white/10 pl-3">
                      {visibleChildren.map((child: any) => renderLink(child))}
                    </div>
                  {/* {isOpen && (
                  )} */}
                </div>
              );
            }

            // ── Standalone top-level link (Dashboard, Reports, Settings...) ──
            if (!canShow(item)) return null;
            return renderLink(item);
          })}
        </div>
      </div>

      {/* Bottom Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
      >
        <LogOut size={18} />
        Logout
      </button>

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute left-4 top-4 text-gray-400 transition hover:text-gray-700"
            >
              <X size={18} />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 shadow-lg">
              <Crown className="h-7 w-7 text-white" />
            </div>

            <h2 className="mt-5 text-center text-2xl font-bold text-gray-900">
              {modalTitle}
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-gray-500">
              {modalSub}
            </p>

            <button
              onClick={handleUpgradeClick}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              <Sparkles size={18} />
              {btnTitle}
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => setShowUpgradeModal(false)}
              className="mt-5 w-full text-center text-sm font-medium text-gray-500 transition hover:text-gray-700"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}