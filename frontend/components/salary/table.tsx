"use client";

import { useState, useMemo } from "react";
import Header from "./header";
import Button from "../common/Button";
import { Pencil, Trash, Trash2 } from "lucide-react";


interface Employee {
  firstName: string;
  lastName: string;
}

interface DeductionEarnings {
  label : string;
  amount: number;
}

interface Salary {
  _id: string;
  basicSalary: number;
  employeeId: Employee;
  deductions: DeductionEarnings[];
  earnings: DeductionEarnings[];  
}
// Interface update
interface Props {
  salaries: Salary[];
  onCreate: () => void;
  onEdit?: (salaries: Salary) => void;  
    // onView → onEdit
  onDelete?: (salaries: Salary) => void;
}

// Component signature

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

export default function Table({ salaries, onCreate, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return salaries.filter(f =>
      f.employeeId.firstName?.toLowerCase().includes(q)
    );
  }, [salaries, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      sortDir === "asc"
        ? a.employeeId.firstName.toLowerCase().localeCompare(b.employeeId.firstName.toLowerCase())
        : b.employeeId.firstName.toLowerCase().localeCompare(a.employeeId.firstName.toLowerCase())
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
        total={salaries.length}
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
                  Employee Name <SortIcon active dir={sortDir} />
                </th>
                <th style={thStyle()}>Basic Salary</th>
                <th style={thStyle()}>Net Salary</th>
                <th style={thStyle()}>Status</th>
                <th style={{ ...thStyle(), textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
                    <p style={{ fontWeight: 600, color: "#64748b", margin: "0 0 4px" }}>No salaries found</p>
                    <p style={{ fontSize: 13, margin: 0 }}>Try adjusting your search or add a new salaries</p>
                  </td>
                </tr>
              ) : paginated.map((salary, i) => {
                const isHovered = hoveredRow === salary._id;
                const isLast = i === paginated.length - 1;
                const avatar = avatarColors[i % avatarColors.length];
                const globalIndex = (page - 1) * pageSize + i + 1;
                // const isActive = salary.status === true || (salary.status as any) === "true";
                const isActive = true;

                const totalEarn = salary.earnings.reduce((sum, item) => sum + item.amount, 0)
                const totalDeduct = salary.deductions.reduce((d, item) => d + item.amount, 0)
                const netAmount:number = salary.basicSalary + totalEarn - totalDeduct; 
                  // const netAmount = 2100; 

                return (
                  <tr
                    key={salary._id}
                    onMouseEnter={() => setHoveredRow(salary._id)}
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

                    {/* Designation Name — with avatar */}
                    <td style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: avatar.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 800, color: avatar.color
                        }}>
                          {salary.employeeId.firstName?.charAt(0).toUpperCase()}
                        </div>
                        <p style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 14 }}>
                          {`${salary.employeeId.firstName}  ${salary.employeeId.lastName}`}
                        </p>
                      </div>
                    </td>

                    {/* Slug — code style, no avatar */}
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
                        {salary.basicSalary}
                      </code>
                    </td>

                    {/* Slug — code style, no avatar */}
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
                        {netAmount}
                      </code>
                    </td>

                    {/* Status badge — corrected logic */}
                    <td style={{ padding: "16px 18px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: isActive ? "#dcfce7" : "#fef2f2",
                        color: isActive ? "#15803d" : "#dc2626",
                        fontSize: 11, fontWeight: 700,
                        padding: "4px 10px", borderRadius: 99,
                        border: `1px solid ${isActive ? "#86efac" : "#fca5a5"}`,
                        letterSpacing: "0.04em", textTransform: "uppercase"
                      }}>
                        {/* Animated dot */}
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: isActive ? "#16a34a" : "#dc2626",
                          boxShadow: isActive ? "0 0 0 2px rgba(22,163,74,.2)" : "0 0 0 2px rgba(220,38,38,.2)"
                        }} />
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>

                        {/* Edit button */}                      
                        <Button
                          type="primary"
                          outline disabled
                          title="View"
                        />

                        <Button
                          type="success"
                          outline
                          title="Edit"
                          onClick={()=> onEdit?.(salary)}
                          icon={<Pencil size={13}/>}
                        />

                        {/* Delete — always enabled */}                       
                        <Button
                          type="danger"
                          title="Delete"
                          disabled
                          outline
                          onClick={()=> onDelete?.(salary)}
                          icon={<Trash2 size={13}/>}
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