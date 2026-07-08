"use client";

import { useState, useMemo } from "react";
import Header from "./header";
import Button from "../common/Button";
import { Trash2 } from "lucide-react";

interface Leave {
  _id: string;
  reason: string;
  status: string; // "approved" | "pending" | "cancelled"
  type: string;
  date?: Date;
  fromDate?: Date;
  toDate?: Date;
}

interface Props {
  leaves: Leave[];
  onCreate: () => void;
  onDelete?: (leave: Leave) => void;
}

type SortDir = "asc" | "desc";
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

const statusStyles: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
  approved: { label: "Approved", bg: "#dcfce7", color: "#15803d", border: "#86efac", dot: "#16a34a" },
  pending: { label: "Pending", bg: "#fef9c3", color: "#a16207", border: "#fde047", dot: "#ca8a04" },
  cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#dc2626" },
};

const formatDate = (d?: Date) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function LeaveTable({ leaves, onCreate, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leaves.filter(f =>
      f.reason?.toLowerCase().includes(q)
    );
  }, [leaves, search]);

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

  return (
    <div>
      <Header
        onCreate={onCreate}
        search={search}
        onSearch={v => { setSearch(v); setPage(1); }}
        total={leaves.length}
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
                <th style={thStyle(true)} onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>
                  Reason <SortIcon active dir={sortDir} />
                </th>
                <th style={thStyle()}>Type</th>
                <th style={thStyle()}>Days</th>
                <th style={thStyle()}>Status</th>
                <th style={{ ...thStyle(), textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8" }}>
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

                    {/* Reason — with avatar */}
                    <td style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: avatar.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 800, color: avatar.color
                        }}>
                          {leave.reason?.charAt(0).toUpperCase()}
                        </div>
                        <p style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 14 }}>
                          {leave.reason}
                        </p>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: "16px 18px" }}>
                      <code style={{
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        padding: "3px 10px",
                        fontSize: 12,
                        fontFamily: "monospace",
                        color: "#475569",
                        letterSpacing: "0.02em"
                      }}>
                        {leave.type}
                      </code>
                    </td>

                    {/* Days */}
                    <td style={{ padding: "16px 18px", color: "#475569", fontSize: 13, whiteSpace: "nowrap" }}>
                      {leave.fromDate && leave.toDate
                        ? `${formatDate(leave.fromDate)} – ${formatDate(leave.toDate)}`
                        : formatDate(leave.date)}
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
                          type="danger"
                          icon={<Trash2 size={13} />}
                          onClick={() => onDelete?.(leave)}
                          outline
                          title="Delete"
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