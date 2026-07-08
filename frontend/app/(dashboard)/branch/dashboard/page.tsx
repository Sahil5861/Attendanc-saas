// app/(super-admin)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  Building2, GitBranch, Users, IndianRupee,
  CreditCard, ShieldCheck,
} from "lucide-react";

import { useSelector } from "react-redux";
import { RootState } from "@/store";

import { loadBranchDashboardData } from "@/services/super-admin.service";



import {
  StatCard, SectionCard, ProgressRow, ActivityFeed,
  RevenueAreaChart, DonutChart, StatusBadge, SimpleTableRow,
  type ActivityItem, type RevenuePoint,
} from "@/components/dashboard/DashboardComponents";

// ── Types matching actual API response ────────────────────────────────
interface Company {
  _id: string;
  companyName: string;
  ownerName: string;
  address: string;
  status: boolean;
  createdAt: string;
}
interface Branch {
  _id: string;
  companyId: string;
  branchName: string;
  city: string;
  state: string;
  status: boolean;
  createdAt: string;
}
interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string;
  status: boolean;
  createdAt: string;
}
interface Plan {
  _id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  status: boolean;
  createdAt: string;
}
interface Role { _id: string; name: string; }

// ── Helpers ────────────────────────────────────────────────────────────
function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000)   return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function buildRevenueData(companies: Company[], plans: Plan[]): RevenuePoint[] {
  const avgPrice = plans.length > 0
    ? plans.reduce((s, p) => s + p.monthlyPrice, 0) / plans.length
    : 0;
  const buckets: Record<string, number> = {};
  companies.forEach((c) => {
    const key = new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    buckets[key] = (buckets[key] ?? 0) + 1;
  });
  return Object.entries(buckets).slice(-6).map(([month, count]) => ({
    month: month.split(" ")[0],
    revenue: Math.round(count * avgPrice),
    target:  Math.round(count * avgPrice * 1.2),
  }));
}

function buildPlanDist(plans: Plan[]) {
  const COLORS: Record<string, string> = {
    Enterprise: "#8b5cf6", "Pro Plan": "#06b6d4",
    "Basic Plan": "#10b981", Custom: "#f59e0b",
  };
  const total = plans.length || 1;
  return plans.map((p) => ({
    name:  p.name,
    value: Math.round((1 / total) * 100),
    color: COLORS[p.name] ?? "#f59e0b",
    count: 1,
  }));
}

function buildRecentCompanies(companies: Company[]) {
  return [...companies]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((c) => ({
      id:     c._id,
      name:   c.companyName,
      plan:   "—",
      status: (c.status ? "active" : "inactive") as "active" | "inactive" | "trial" | "expired",
      date:   formatDate(c.createdAt),
    }));
}

function buildActivity(
  companies: Company[], branches: Branch[], employees: Employee[]
): ActivityItem[] {
  const events: { time: Date; item: ActivityItem }[] = [];
  companies.forEach((c) => events.push({
    time: new Date(c.createdAt),
    item: { id: `c-${c._id}`, title: `${c.companyName} registered`,
            sub: `Owner: ${c.ownerName} · ${c.address}`, time: "", type: "company" },
  }));
  branches.forEach((b) => events.push({
    time: new Date(b.createdAt),
    item: { id: `b-${b._id}`, title: "New branch added",
            sub: `${b.branchName} · ${b.city}, ${b.state}`, time: "", type: "branch" },
  }));
  employees.forEach((e) => events.push({
    time: new Date(e.createdAt),
    item: { id: `e-${e._id}`, title: "Employee added",
            sub: `${e.firstName} ${e.lastName} · ${e.designation}, ${e.department}`, time: "", type: "employee" },
  }));
  return events
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 6)
    .map(({ time, item }) => ({ ...item, time: formatDate(time.toISOString()) }));
}

// ── Skeleton ───────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} aria-hidden />;
}
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-sm">
      <Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-20" />
    </div>
  );
}


// ── Page ───────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const [userName,  setUserName]  = useState("Admin");
  const [loading,   setLoading]   = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches,  setBranches]  = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [plans,     setPlans]     = useState<Plan[]>([]);
  const [roles,     setRoles]     = useState<Role[]>([]);

  
  const user = useSelector((state: RootState) => state.auth.user);
  // const branchId = user?.branchId;
  const branchId = Cookies.get("active_branch_id");

  console.log('branchId : ',branchId);
  

  // ── Fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!branchId) return;

    (async () => {
      try {
        const res = await loadBranchDashboardData(branchId);
        const d = res?.data?.data ?? {};

        console.log("d:", d);

        setEmployees(d.employees ?? []);
      } catch (err) {
        console.error("[Dashboard] fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [branchId]);

  // ── Cookie ───────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = Cookies.get("user");
      if (raw) { const u = JSON.parse(raw); setUserName(u?.name || u?.email || "Admin"); }
    } catch { /* ignore */ }
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────
  const activeCompanies   = companies.filter((c) => c.status === true);
  const inactiveCompanies = companies.filter((c) => c.status === false);
  const activePlans       = plans.filter((p) => p.status === true);
  const mrr               = activePlans.reduce((s, p) => s + p.monthlyPrice, 0);
  const total             = companies.length || 1;
  const activeP           = Math.round((activeCompanies.length  / total) * 100);
  const inactiveP         = Math.round((inactiveCompanies.length / total) * 100);
  const revenueData       = buildRevenueData(companies, activePlans);
  const planDist          = buildPlanDist(plans);
  const recentCompanies   = buildRecentCompanies(companies);
  const activityItems     = buildActivity(companies, branches, employees);
  const hour              = new Date().getHours();
  const greeting          = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-7 pb-10">

      {/* ── Greeting ── */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, {userName} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here's a snapshot of your Branch today.</p>
        </div>
        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      {/* ── Primary stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : (
          <>           
            <StatCard
              label="Employees"
              value={employees.length.toLocaleString("en-IN")}
              sub="Total workforce"
              icon={<Users size={20} />}
              accent="violet"
            />
          </>
        )}
      </div>
     
      {/* ── Health + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <SectionCard title="Company Health" subtitle="Active vs inactive breakdown">
          {loading ? (
            <div className="space-y-5">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
            </div>
          ) : (
            <div className="space-y-5">
              <ProgressRow
                label="Active"
                value={activeP}
                count={`${activeCompanies.length} ${activeCompanies.length === 1 ? "company" : "companies"}`}
                color="bg-emerald-500"
              />
              <ProgressRow
                label="Inactive"
                value={inactiveP}
                count={`${inactiveCompanies.length} ${inactiveCompanies.length === 1 ? "company" : "companies"}`}
                color="bg-slate-300"
              />
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Activity" subtitle="Latest platform events">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40" /><Skeleton className="h-3 w-52" />
                  </div>
                </div>
              ))}
            </div>
          ) : activityItems.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No recent activity.</p>
          ) : (
            <ActivityFeed items={activityItems} />
          )}
        </SectionCard>

      </div>
    </div>
  );
}