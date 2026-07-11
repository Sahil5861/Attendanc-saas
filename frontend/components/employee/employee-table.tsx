"use client";

import { useState, useMemo, useEffect } from "react";
import CompanyHeader from "./employee-header";
import { Edit2, Eye, Trash2 } from "lucide-react";
import Button from "../common/Button";
import CustomToggle from "../common/CustomToggle";
import { updateEmployeeStatus } from "@/services/branch.service";
import toast from "react-hot-toast";

export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  image: File | null | string;

  designation: {
    _id: string;
    name: string;
  };
  department: {
    _id: string;
    name: string;
  };
  joiningDate: string;
  employmentType: string;

  basicSalary: number;
  salaryType: string;

  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;

  shiftName: string;
  shiftStartTime: string;
  shiftEndTime: string;

  password: string;
  isLoginEnabled: boolean;
  status: boolean;
}
interface Props {
  employees: Employee[];
  loading: boolean;
  onCreate: () => void;
  onEdit?: (employee: Employee) => void;
  onView?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onViewSalary?: (employee: Employee) => void;
}

type SortKey = "firstName" | "lastName";
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

export default function Table({ employees, loading, onCreate, onEdit, onView, onDelete, onViewSalary }: Props) {

  const [employeeList, setEmployeeList] = useState(employees);



  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("firstName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  useEffect(() => {
    setEmployeeList(employees);
  }, [employees]);


  const updateEmployee = async (id: string, value: boolean) => {

    try {

      const payload = {
        status: value,
      };
      const res = await updateEmployeeStatus(id, payload);

      if (res?.data.success == true) {

        setEmployeeList(prev => 
          prev.map(emp => 
            emp._id === id ? {...emp, status: value} : emp
          )
        )
        toast.success(res.data.message || "Employee status updated successfully.");
      }
      else {
        toast.error(res.data.message || "Failed to update employee status.");
      }

    } catch (error) {
        toast.error('Something went wrong !');
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employeeList.filter(c =>
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  }, [employeeList, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = (a[sortKey] || "").toLowerCase();
      const bv = (b[sortKey] || "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const thStyle = (key?: SortKey): React.CSSProperties => ({
    padding: "14px 18px",
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: key ? "pointer" : "default",
    userSelect: "none",
    whiteSpace: "nowrap",
    background: "#f8fffe",
    borderBottom: "1.5px solid #d1fae5",
  });




  return (
    <div>
      <CompanyHeader
        onCreate={onCreate}
        search={search}
        onSearch={v => { setSearch(v); setPage(1); }}
        total={employees.length}
      />

      {/* Table card */}
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
                <th style={thStyle("firstName")} onClick={() => handleSort("firstName")}>
                  Name <SortIcon active={sortKey === "firstName"} dir={sortDir} />
                </th>
                <th style={thStyle()}>
                  Email
                </th>
                <th style={thStyle()}>Phone</th>
                <th style={thStyle()}>Status</th>
                <th style={{ ...thStyle(), textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🏢</div>
                    <p style={{ fontWeight: 600, color: "#64748b", margin: "0 0 4px" }}>No companies found</p>
                    <p style={{ fontSize: 13, margin: 0 }}>Try adjusting your search</p>
                  </td>
                </tr>
              ) : paginated.map((employee, i) => {
                const isHovered = hoveredRow === employee._id;
                const isLast = i === paginated.length - 1;
                const name = `${employee.firstName}  ${employee.lastName}`
                return (
                  <tr
                    key={employee._id}
                    onMouseEnter={() => setHoveredRow(employee._id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: isLast ? "none" : "1px solid #f0fdf4",
                      background: isHovered ? "#f0fdf8" : "#fff",
                      transition: "background .15s"
                    }}
                  >
                    {/* name */}
                    <td style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: "linear-gradient(135deg, #d1fae5, #cffafe)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 700, color: "#065f46"
                        }}>
                          {name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 14 }}>
                            {name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* email */}
                    <td style={{ padding: "16px 18px", color: "#334155", fontWeight: 500 }}>
                      {employee.email}
                    </td>

                    {/* phone */}
                    <td style={{ padding: "16px 18px", color: "#334155", fontWeight: 500 }}>
                      {employee.phone}
                    </td>



                    {/* Status */}
                    <td style={{ padding: "16px 18px" }}>                    
                      <CustomToggle
                        checked={employee.status}
                        onChange={(value) => updateEmployee(employee._id, value)}
                      />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Button
                          type="success"
                          outline
                          title="Edit"
                          icon={<Edit2 size={13} />}
                          permission="employee.edit"
                          onClick={() => onEdit?.(employee)}
                        />

                        <Button
                          type="info"
                          outline
                          permission="employee.view"
                          title="View"
                          icon={<Eye size={13} />}
                          onClick={() => onView?.(employee)}
                        />

                        <Button
                          type="danger"
                          title="Delete"
                          icon={<Trash2 size={13} />}
                          outline
                          permission="employee.delete"
                          onClick={() => onDelete?.(employee)}
                        />

                        <Button
                          type="info"
                          title="View Salary"
                          icon={<Eye size={13} />}
                          outline
                          permission="employee.view"
                          onClick={() => onViewSalary?.(employee)}
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
          {/* Left: rows per page + count */}
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

          {/* Right: page buttons */}
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