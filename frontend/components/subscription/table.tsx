"use client";

import { useState, useMemo } from "react";
import Header from "./header";
import { BranchSubscription } from "../interface";

interface Props {
  subscription: BranchSubscription[];
  onCreate?: () => void;
  onEdit?: (subscription: BranchSubscription) => void;
  onDelete?: (subscription: BranchSubscription) => void;
}

type SortDir = "asc" | "desc";
type SortKey = "amount" | "createdAt";
const PAGE_SIZE_OPTIONS = [5, 10, 25];

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 1, marginLeft: 5, opacity: active ? 1 : 0.3 }}>
      <svg width="8" height="5" viewBox="0 0 8 5" fill={active && dir === "asc" ? "#059669" : "#94a3b8"}><path d="M4 0l4 5H0z" /></svg>
      <svg width="8" height="5" viewBox="0 0 8 5" fill={active && dir === "desc" ? "#059669" : "#94a3b8"}><path d="M4 5L0 0h8z" /></svg>
    </span>
  );
}

const avatarColors = [
  { bg: "linear-gradient(135deg, #d1fae5, #cffafe)", color: "#065f46" },
  { bg: "linear-gradient(135deg, #cffafe, #e0f2fe)", color: "#0e7490" },
  { bg: "linear-gradient(135deg, #dcfce7, #d1fae5)", color: "#166534" },
  { bg: "linear-gradient(135deg, #e0f2fe, #cffafe)", color: "#075985" },
];

// NOTE: assumes populated Branch / Plan objects expose a `name` field.
// Adjust the field name below if your Branch/Plan interfaces differ.
function displayName(value: any, fallbackPrefix: string): string {
  if (!value) return "—";
  // if (typeof value === "string") return value.length > 10 ? `${value.slice(0, 8)}…` : value;
  return value.branchName ?? value.name ?? `${fallbackPrefix} ${(value._id ?? "").toString().slice(-6)}`;
}

const billingCycleLabels: Record<BranchSubscription["billingCycle"], string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  halfYearly: "Half-Yearly",
  yearly: "Yearly",
};

const statusStyles: Record<BranchSubscription["status"], { bg: string; color: string; border: string; dot: string; label: string }> = {
  created: { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1", dot: "#64748b", label: "Created" },
  authenticated: { bg: "#e0f2fe", color: "#0369a1", border: "#7dd3fc", dot: "#0284c7", label: "Authenticated" },
  active: { bg: "#dcfce7", color: "#15803d", border: "#86efac", dot: "#16a34a", label: "Active" },
  pending: { bg: "#fef3c7", color: "#b45309", border: "#fcd34d", dot: "#d97706", label: "Pending" },
  halted: { bg: "#ffedd5", color: "#c2410c", border: "#fdba74", dot: "#ea580c", label: "Halted" },
  cancelled: { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#dc2626", label: "Cancelled" },
  completed: { bg: "#e0f2fe", color: "#0e7490", border: "#67e8f9", dot: "#0891b2", label: "Completed" },
  expired: { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1", dot: "#94a3b8", label: "Expired" },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 0 }).format(amount ?? 0);
  } catch {
    return `${currency ?? ""} ${amount ?? 0}`;
  }
}

export default function Table({ subscription, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return subscription;
    return subscription.filter(f => {
      const branchLabel = displayName(f.branch_id, "Branch").toLowerCase();
      const planLabel = displayName(f.plan_id, "Plan").toLowerCase();
      return (
        f.razorpaySubscriptionId?.toLowerCase().includes(q) ||
        f.status?.toLowerCase().includes(q) ||
        f.billingCycle?.toLowerCase().includes(q) ||
        branchLabel.includes(q) ||
        planLabel.includes(q)
      );
    });
  }, [subscription, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "amount") {
        cmp = (a.amount ?? 0) - (b.amount ?? 0);
      } else {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const thStyle = (sortable?: boolean): React.CSSProperties => ({
    padding: "14px 18px",
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: sortable ? "pointer" : "default",
    userSelect: "none",
    whiteSpace: "nowrap",
    background: "#f8fffe",
    borderBottom: "1.5px solid #d1fae5",
  });

  return (
    <div>
      <Header
        search={search}
        onSearch={v => { setSearch(v); setPage(1); }}
        total={subscription.length}
      />

      <div style={{
        background: "#fff",
        border: "1.5px solid #d1fae5",
        borderRadius: 16,
        marginTop: 24,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(16,185,129,.06)"
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle(), width: 48, textAlign: "center" }}>#</th>
                <th style={thStyle()}>Branch / Plan</th>
                <th style={thStyle()}>Billing Cycle</th>
                <th style={thStyle(true)} onClick={() => toggleSort("amount")}>
                  Amount <SortIcon active={sortKey === "amount"} dir={sortDir} />
                </th>
                <th style={thStyle()}>Payments</th>
                <th style={thStyle()}>Current Period</th>
                <th style={thStyle()}>Status</th>
                <th style={thStyle(true)} onClick={() => toggleSort("createdAt")}>
                  Created <SortIcon active={sortKey === "createdAt"} dir={sortDir} />
                </th>
                {/* <th style={{ ...thStyle(), textAlign: "right" }}>Actions</th> */}
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
                    <p style={{ fontWeight: 600, color: "#64748b", margin: "0 0 4px" }}>No subscription found</p>
                    <p style={{ fontSize: 13, margin: 0 }}>Try adjusting your search or add a new subscription</p>
                  </td>
                </tr>
              ) : paginated.map((sub, i) => {
                const isHovered = hoveredRow === sub._id;
                const isLast = i === paginated.length - 1;
                const avatar = avatarColors[i % avatarColors.length];
                const globalIndex = (page - 1) * pageSize + i + 1;
                const statusStyle = statusStyles[sub.status] ?? statusStyles.created;
                const branchLabel = displayName(sub.branch_id, "Branch");
                const planLabel = displayName(sub.plan_id, "Plan");
                const progressPct = sub.totalCount ? Math.min(100, Math.round((sub.paidCount / sub.totalCount) * 100)) : null;

                return (
                  <tr
                    key={sub._id}
                    onMouseEnter={() => setHoveredRow(sub._id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: isLast ? "none" : "1px solid #f0fdf4",
                      background: isHovered ? "#f0fdf8" : "#fff",
                      transition: "background .15s"
                    }}
                  >
                    {/* Index */}
                    <td style={{ padding: "16px 18px", textAlign: "center", color: "#cbd5e1", fontSize: 12, fontWeight: 600 }}>
                      {globalIndex}
                    </td>

                    {/* Branch / Plan — with avatar */}
                    <td style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: avatar.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 800, color: avatar.color
                        }}>
                          {branchLabel.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 14 }}>
                            {branchLabel}
                          </p>
                          <code style={{ fontSize: 11, color: "#94a3b8" }}>{planLabel}</code>
                        </div>
                      </div>
                    </td>

                    {/* Billing cycle badge */}
                    <td style={{ padding: "16px 18px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        padding: "4px 10px", borderRadius: 99,
                        background: "#ede9fe", color: "#6d28d9",
                        letterSpacing: "0.04em", textTransform: "uppercase"
                      }}>
                        {billingCycleLabels[sub.billingCycle] ?? sub.billingCycle}
                      </span>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: "16px 18px", color: "#0f172a", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {formatCurrency(sub.amount, sub.currency)}
                    </td>

                    {/* Payments progress */}
                    <td style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 90 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                          {sub.paidCount ?? 0}{sub.totalCount ? ` / ${sub.totalCount}` : ""}
                        </span>
                        {progressPct !== null && (
                          <div style={{ width: "100%", height: 5, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                            <div style={{ width: `${progressPct}%`, height: "100%", background: "linear-gradient(90deg,#059669,#0891b2)" }} />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Current period */}
                    <td style={{ padding: "16px 18px", color: "#334155", fontSize: 12, whiteSpace: "nowrap" }}>
                      {formatDate(sub.currentStart)} → {formatDate(sub.currentEnd)}
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: "16px 18px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        fontSize: 11, fontWeight: 700,
                        padding: "4px 10px", borderRadius: 99,
                        border: `1px solid ${statusStyle.border}`,
                        letterSpacing: "0.04em", textTransform: "uppercase"
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: statusStyle.dot,
                          boxShadow: `0 0 0 2px ${statusStyle.dot}33`
                        }} />
                        {statusStyle.label}
                      </span>
                    </td>

                    {/* Created */}
                    <td style={{ padding: "16px 18px", color: "#334155", fontSize: 13, whiteSpace: "nowrap" }}>
                      {formatDate(sub.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderTop: "1.5px solid #d1fae5",
          background: "#f8fffe", flexWrap: "wrap", gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              style={{
                border: "1.5px solid #d1fae5", borderRadius: 8,
                padding: "5px 10px", fontSize: 13, color: "#0f172a",
                background: "#fff", outline: "none", cursor: "pointer"
              }}
            >
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              {filtered.length === 0 ? "0" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)}`} of {filtered.length}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <PagBtn onClick={() => setPage(1)} disabled={page === 1} label="«" />
            <PagBtn onClick={() => setPage(p => p - 1)} disabled={page === 1} label="‹" />
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p); return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} style={{ padding: "0 4px", color: "#94a3b8", fontSize: 13 }}>…</span>
                ) : (
                  <PagBtn key={p} onClick={() => setPage(p as number)} disabled={false} active={page === p} label={String(p)} />
                )
              )}
            <PagBtn onClick={() => setPage(p => p + 1)} disabled={page === totalPages} label="›" />
            <PagBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} label="»" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PagBtn({ onClick, disabled, label, active }: {
  onClick: () => void; disabled: boolean; label: string; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32, borderRadius: 8, border: "1.5px solid",
        borderColor: active ? "#059669" : "#d1fae5",
        background: active ? "linear-gradient(135deg, #059669, #0891b2)" : "#fff",
        color: active ? "#fff" : disabled ? "#cbd5e1" : "#334155",
        fontSize: 13, fontWeight: active ? 700 : 400,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .15s"
      }}
    >
      {label}
    </button>
  );
}