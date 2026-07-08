// components/dashboard/DashboardComponents.tsx
"use client";

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────
export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  accent: "emerald" | "cyan" | "violet" | "amber" | "rose";
}

export interface ProgressRowProps {
  label: string;
  value: number;       // 0–100
  count?: string;
  color: string;       // tailwind bg class
}

export interface ActivityItem {
  id: string;
  title: string;
  sub: string;
  time: string;
  type: "company" | "branch" | "employee" | "plan" | "payment";
}

export interface RevenuePoint { month: string; revenue: number; target?: number; }
export interface BarPoint     { label: string; value: number; }

// ── Accent map ─────────────────────────────────────────────────────────
const ACCENT: Record<StatCardProps["accent"], { icon: string; badge: string; text: string; border: string; glow: string }> = {
  emerald: { icon: "from-emerald-400 to-teal-500",   badge: "bg-emerald-50 text-emerald-700 border-emerald-200",  text: "text-emerald-600", border: "border-emerald-100", glow: "shadow-emerald-100" },
  cyan:    { icon: "from-cyan-400 to-sky-500",       badge: "bg-cyan-50 text-cyan-700 border-cyan-200",           text: "text-cyan-600",    border: "border-cyan-100",    glow: "shadow-cyan-100"    },
  violet:  { icon: "from-violet-400 to-purple-500",  badge: "bg-violet-50 text-violet-700 border-violet-200",     text: "text-violet-600",  border: "border-violet-100",  glow: "shadow-violet-100"  },
  amber:   { icon: "from-amber-400 to-orange-500",   badge: "bg-amber-50 text-amber-700 border-amber-200",        text: "text-amber-600",   border: "border-amber-100",   glow: "shadow-amber-100"   },
  rose:    { icon: "from-rose-400 to-pink-500",      badge: "bg-rose-50 text-rose-700 border-rose-200",           text: "text-rose-600",    border: "border-rose-100",    glow: "shadow-rose-100"    },
};

const ACTIVITY_ICONS: Record<ActivityItem["type"], { emoji: string; bg: string }> = {
  company:  { emoji: "🏢", bg: "bg-emerald-50" },
  branch:   { emoji: "📍", bg: "bg-cyan-50"    },
  employee: { emoji: "👤", bg: "bg-violet-50"  },
  plan:     { emoji: "💳", bg: "bg-amber-50"   },
  payment:  { emoji: "💰", bg: "bg-rose-50"    },
};

// ── StatCard ───────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, trend, accent }: StatCardProps) {
  const a = ACCENT[accent];
  const isUp = (trend?.value ?? 0) >= 0;

  return (
    <div className={`bg-white rounded-2xl border ${a.border} p-5 shadow-sm hover:shadow-md ${a.glow} transition-shadow duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.icon} flex items-center justify-center text-white shadow-sm`}>
          {icon}
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-xs font-700 px-2 py-1 rounded-lg border ${a.badge}`}>
            <span>{isUp ? "↑" : "↓"}</span>
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── SectionCard ────────────────────────────────────────────────────────
export function SectionCard({
  title, subtitle, action, children, className = "",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-6 shadow-sm ${className}`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── ProgressRow ────────────────────────────────────────────────────────
export function ProgressRow({ label, value, count, color }: ProgressRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-700 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {count && <span className="text-xs text-slate-400">{count}</span>}
          <span className="text-sm font-bold text-slate-800">{value}%</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ── ActivityFeed ───────────────────────────────────────────────────────
export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const { emoji, bg } = ACTIVITY_ICONS[item.type];
        return (
          <div key={item.id} className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center text-base flex-shrink-0`}>
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
              <p className="text-xs text-slate-400 truncate">{item.sub}</p>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">{item.time}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── RevenueAreaChart ───────────────────────────────────────────────────
export function RevenueAreaChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="tgtGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `₹${v >= 100000 ? `${(v / 100000).toFixed(1)}L` : `${(v / 1000).toFixed(0)}k`}`}
        />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1.5px solid #d1fae5", borderRadius: 10, fontSize: 12 }}
          formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
        />
        {data[0]?.target !== undefined && (
          <Area type="monotone" dataKey="target" stroke="#6366f1" strokeWidth={1.5}
            fill="url(#tgtGrad)" strokeDasharray="5 3" dot={false} name="Target"
          />
        )}
        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5}
          fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#10b981" }} name="Revenue"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── SimpleBarChart ─────────────────────────────────────────────────────
export function SimpleBarChart({ data, color = "#10b981" }: { data: BarPoint[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 12 }}
          cursor={{ fill: "#f8fafc" }}
        />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── DonutChart ─────────────────────────────────────────────────────────
export function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
          paddingAngle={3} dataKey="value" stroke="none"
        >
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 12 }}
        />
        <Legend iconType="circle" iconSize={8}
          formatter={(v) => <span style={{ fontSize: 12, color: "#64748b" }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── StatusBadge ────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: "active" | "trial" | "expired" | "inactive" }) {
  const map = {
    active:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    trial:    "bg-amber-50 text-amber-700 border-amber-200",
    expired:  "bg-red-50 text-red-600 border-red-200",
    inactive: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

// ── TableRow helper ────────────────────────────────────────────────────
export function SimpleTableRow({ cols, last = false }: { cols: React.ReactNode[]; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 py-3 ${!last ? "border-b border-slate-50" : ""}`}>
      {cols.map((col, i) => (
        <div key={i} className="flex-1 min-w-0">{col}</div>
      ))}
    </div>
  );
}