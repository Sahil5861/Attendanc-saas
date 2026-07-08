"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "./header";
import Button from "../common/Button";
import {
  MessageSquareQuote,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
// ⚠️ Adjust this import/function names to match your actual service file
import { updateLeaveStatus } from "@/services/branch.service";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Leave {
  _id: string;
  reason: string;
  status: string; // "approved" | "pending" | "cancelled" | "rejected"
  type: string;
  daysType: "single" | "multiple";
  date?: Date;
  fromDate?: Date;
  toDate?: Date;
  employeeId: Employee;
}

interface Props {
  leaves: Leave[];

}

type SortDir = "asc" | "desc";
const PAGE_SIZE_OPTIONS = [5, 10, 25];

const avatarColors = [
  { bg: "linear-gradient(135deg, #d1fae5, #cffafe)", color: "#065f46" },
  { bg: "linear-gradient(135deg, #cffafe, #e0f2fe)", color: "#0e7490" },
  { bg: "linear-gradient(135deg, #dcfce7, #d1fae5)", color: "#166534" },
  { bg: "linear-gradient(135deg, #e0f2fe, #cffafe)", color: "#075985" },
];

const statusStyles: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
  approved: { label: "Approved", bg: "#dcfce7", color: "#15803d", border: "#86efac", dot: "#16a34a" },
  pending: { label: "Pending", bg: "#fef9c3", color: "#a16207", border: "#fde047", dot: "#ca8a04" },
  rejected: { label: "Rejected", bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#dc2626" },
  cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#dc2626" },
};

const formatDate = (d?: Date) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// Number of days between fromDate and toDate (inclusive)
function calcNumberOfDays(leave: Leave) {
  if (leave.daysType === "single") return 1;

  if (!leave.fromDate || !leave.toDate) return 1;

  const from = new Date(leave.fromDate);
  const to = new Date(leave.toDate);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) return 1;

  const diffMs = to.setHours(0, 0, 0, 0) - from.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;

  return Math.max(diffDays, 1);
}

export default function LeaveTable({ leaves }: Props) {
  const [localLeaves, setLocalLeaves] = useState<Leave[]>(leaves);
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [reasonLeave, setReasonLeave] = useState<Leave | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    setLocalLeaves(leaves);
  }, [leaves]);

  // Unique employee list for the filter dropdown
  const employeeOptions = useMemo(() => {
    const map = new Map<string, string>();
    localLeaves.forEach((l) => {
      if (l.employeeId?._id) {
        map.set(l.employeeId._id, `${l.employeeId.firstName} ${l.employeeId.lastName}`);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [localLeaves]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return localLeaves.filter((f) => {
      const matchesSearch = f.reason?.toLowerCase().includes(q);
      const matchesEmployee = !employeeFilter || f.employeeId?._id === employeeFilter;
      return matchesSearch && matchesEmployee;
    });
  }, [localLeaves, search, employeeFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      sortDir === "asc"
        ? a.reason.toLowerCase().localeCompare(b.reason.toLowerCase())
        : b.reason.toLowerCase().localeCompare(a.reason.toLowerCase())
    );
  }, [filtered, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

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

  const handleDecision = async (leave: Leave, decision: "approved" | "rejected") => {
    if (actioningId) return;

    try {
      setActioningId(leave._id);
      const res = await updateLeaveStatus(leave._id, decision);

      if (res?.data?.success) {
        toast.success(res.data.message || `Leave ${decision}`);
        setLocalLeaves((prev) =>
          prev.map((item) => (item._id === leave._id ? { ...item, status: decision } : item))
        );
      } else {
        toast.error(res?.data?.message || `Failed to ${decision === "approved" ? "approve" : "reject"} leave`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, please try again");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <Header
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        total={leaves.length}
        employees={employeeOptions}
        employeeFilter={employeeFilter}
        onEmployeeFilter={(v) => {
          setEmployeeFilter(v);
          setPage(1);
        }}
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
                <th style={{ ...thStyle(), textAlign: 'left' }}>Employee Name</th>
                <th style={{ ...thStyle(), textAlign: 'left' }}>Mode</th>
                <th style={{ ...thStyle(), textAlign: 'left' }}>Date</th>
                <th style={{ ...thStyle(), width: 150, textAlign: 'left' }}>Leave Type</th>
                <th style={{ ...thStyle(), textAlign: 'left' }}>No Of Days</th>
                <th style={{ ...thStyle(), textAlign: 'left' }}>Reason</th>
                <th style={{ ...thStyle(), textAlign: 'left' }}>Status</th>
                <th style={{ ...thStyle(), textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  {/* fixed: table now has 8 columns */}
                  <td colSpan={8} style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
                    <p style={{ fontWeight: 600, color: "#64748b", margin: "0 0 4px" }}>No leaves found</p>
                    <p style={{ fontSize: 13, margin: 0 }}>Try adjusting your search or add a new leave</p>
                  </td>
                </tr>
              ) : paginated.map((leave, i) => {
                const isHovered = hoveredRow === leave._id;
                const isLast = i === paginated.length - 1;
                const avatar = avatarColors[i % avatarColors.length];
                const globalIndex = (page - 1) * pageSize + i + 1;

                const statusInfo = statusStyles[leave.status] ?? {
                  label: leave.status || "Unknown",
                  bg: "#f1f5f9", color: "#475569", border: "#e2e8f0", dot: "#94a3b8",
                };

                const mode = leave.daysType === 'single' ? 'Full Day' : 'Multi Day';
                const numberOfDays = calcNumberOfDays(leave);
                const isPending = leave.status === "pending";
                const isActioning = actioningId === leave._id;

                return (
                  <tr
                    key={leave._id}
                    onMouseEnter={() => setHoveredRow(leave._id)}
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

                    {/* Employee name — with avatar */}
                    <td style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: avatar.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 800, color: avatar.color
                        }}>
                          {leave.employeeId?.firstName?.charAt(0).toUpperCase()}
                        </div>
                        <p style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 14 }}>
                          {`${leave.employeeId?.firstName ?? ""} ${leave.employeeId?.lastName ?? ""}`}
                        </p>
                      </div>
                    </td>

                    <td style={{ padding: '16px 18px' }}>
                      <p style={{ margin: 0 }}>{mode}</p>
                    </td>

                    {/* Date — single date, or from–to range for multi-day leaves */}
                    <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>
                        {leave.daysType === 'single'
                          ? formatDate(leave.date)
                          : `${formatDate(leave.fromDate)} – ${formatDate(leave.toDate)}`}
                      </p>
                    </td>

                    {/* Leave Type */}
                    <td style={{ padding: '16px 18px' }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        background: "#f0f9ff", color: "#0369a1",
                        fontSize: 11, fontWeight: 700,
                        padding: "3px 10px", borderRadius: 99,
                        border: "1px solid #bae6fd",
                        letterSpacing: "0.03em", textTransform: "capitalize",
                      }}>
                        {`${leave.type} Leave` || "—"}
                      </span>
                    </td>

                    <td style={{ padding: '16px 18px' }}>
                      <p style={{ margin: 0 }}>{numberOfDays}</p>
                    </td>

                    {/* Reason — click to view full reason in a popup */}
                    <td style={{ padding: '16px 18px' }}>
                      <button
                        onClick={() => setReasonLeave(leave)}
                        title="View reason"
                        style={{
                          background: "#f0fdf4",
                          border: "1px solid #d1fae5",
                          borderRadius: 8,
                          padding: "6px 8px",
                          cursor: "pointer",
                          color: "#059669",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <MessageSquareQuote size={18} />
                      </button>
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: "16px 18px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: statusInfo.bg,
                        color: statusInfo.color,
                        fontSize: 11, fontWeight: 700,
                        padding: "4px 10px", borderRadius: 99,
                        border: `1px solid ${statusInfo.border}`,
                        letterSpacing: "0.04em", textTransform: "uppercase"
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: statusInfo.dot,
                          boxShadow: `0 0 0 2px ${statusInfo.dot}33`
                        }} />
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Button
                          type="success"
                          icon={isActioning ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                          title="Approve"
                          outline
                          disabled={!isPending || isActioning}
                          onClick={() => handleDecision(leave, "approved")}
                        />

                        <Button
                          type="danger"
                          icon={isActioning ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                          title="Reject"
                          outline
                          disabled={!isPending || isActioning}
                          onClick={() => handleDecision(leave, "rejected")}
                        />
                      </div>
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

      {/* Reason popup */}
      {reasonLeave && (
        <div
          onClick={() => setReasonLeave(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 440,
              background: "#fff", borderRadius: 16,
              boxShadow: "0 20px 50px rgba(0,0,0,.2)",
              overflow: "hidden",
            }}
          >
            <div style={{
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              padding: "18px 22px", borderBottom: "1px solid #f1f5f9",
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Leave Reason
                </p>
                <h3 style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                  {reasonLeave.employeeId?.firstName} {reasonLeave.employeeId?.lastName}
                </h3>
              </div>
              <button
                onClick={() => setReasonLeave(null)}
                style={{
                  border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8,
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#64748b",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: "18px 22px" }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#334155" }}>
                {reasonLeave.reason || "No reason provided."}
              </p>
            </div>
          </div>
        </div>
      )}
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