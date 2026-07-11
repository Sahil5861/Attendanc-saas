"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MoreVertical,
  Eye,
  Trash2,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileIcon,
  CalendarDays,
} from "lucide-react";
import Header from "./header";
import { EmployeeDocument } from "./modal";
import { resolveDocumentUrl } from "./fileUrl";

interface Props {
  document: EmployeeDocument[];
  onCreate: () => void;
  onEdit?: (document: EmployeeDocument) => void;
  onView?: (document: EmployeeDocument) => void; // 👈 new — dropdown "View"
  onDelete?: (document: EmployeeDocument) => void;
}

type SortDir = "asc" | "desc";
const PAGE_SIZE_OPTIONS = [6, 12, 24];

const avatarColors = [
  { bg: "linear-gradient(135deg, #d1fae5, #cffafe)", color: "#065f46" },
  { bg: "linear-gradient(135deg, #cffafe, #e0f2fe)", color: "#0e7490" },
  { bg: "linear-gradient(135deg, #dcfce7, #d1fae5)", color: "#166534" },
  { bg: "linear-gradient(135deg, #e0f2fe, #cffafe)", color: "#075985" },
];

// ---------------------------------------------------------------------------
// small helpers — figure out file "kind" from a File object or a plain URL
// ---------------------------------------------------------------------------

type FileKind = "image" | "pdf" | "doc" | "sheet" | "other";

const getExt = (name = "") => name.split(".").pop()?.toLowerCase() || "";

function getKind(file: File | string | null): FileKind {
  if (!file) return "other";
  const name = typeof file === "string" ? file.split("?")[0] : file.name;
  const ext = getExt(name);
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  return "other";
}

const KIND_META: Record<FileKind, { icon: typeof FileText; bg: string; color: string }> = {
  image: { icon: ImageIcon, bg: "#ecfeff", color: "#0e7490" },
  pdf: { icon: FileText, bg: "#fef2f2", color: "#dc2626" },
  doc: { icon: FileText, bg: "#eff6ff", color: "#2563eb" },
  sheet: { icon: FileSpreadsheet, bg: "#f0fdf4", color: "#16a34a" },
  other: { icon: FileIcon, bg: "#f8fafc", color: "#64748b" },
};

function expiryStatus(expiryDate?: string) {
  if (!expiryDate) return null;
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "Expired", bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" };
  if (days <= 30)
    return { label: `Expires in ${days}d`, bg: "#fffbeb", color: "#b45309", border: "#fcd34d" };
  return { label: "Valid", bg: "#f0fdf4", color: "#16a34a", border: "#86efac" };
}

// small thumbnail — shows real image preview when possible, icon otherwise
function DocThumb({ file, kind }: { file: File | string | null; kind: FileKind }) {
  const url = useMemo(
    () => (file instanceof File ? URL.createObjectURL(file) : resolveDocumentUrl(file)),
    [file]
  );

  useEffect(() => {
    return () => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [url]);

  const meta = KIND_META[kind];
  const Icon = meta.icon;

  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        flexShrink: 0,
        background: kind === "image" && url ? "#f1f5f9" : meta.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {kind === "image" && url ? (
        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Icon size={19} color={meta.color} strokeWidth={1.8} />
      )}
    </div>
  );
}

export default function Table({ document, onCreate, onEdit, onView, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    window.document.addEventListener("mousedown", handler);
    return () => window.document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return document.filter(
      (f) =>
        f.documentName?.toLowerCase().includes(q) ||
        f.documentNumber?.toLowerCase().includes(q)
    );
  }, [document, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      sortDir === "asc"
        ? a.documentName.toLowerCase().localeCompare(b.documentName.toLowerCase())
        : b.documentName.toLowerCase().localeCompare(a.documentName.toLowerCase())
    );
  }, [filtered, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <Header
        onCreate={onCreate}
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}        
        total={document.length}
      />

      {/* Sort control — replaces the old clickable column header */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "#059669",
            background: "#f0fdf4",
            border: "1.5px solid #d1fae5",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Sort by name ({sortDir === "asc" ? "A → Z" : "Z → A"})
        </button>
      </div>

      {/* Card grid */}
      {paginated.length === 0 ? (
        <div
          style={{
            padding: "60px 24px",
            textAlign: "center",
            color: "#94a3b8",
            background: "#fff",
            border: "1.5px solid #d1fae5",
            borderRadius: 16,
            marginTop: 16,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
          <p style={{ fontWeight: 600, color: "#64748b", margin: "0 0 4px" }}>No document found</p>
          <p style={{ fontSize: 13, margin: 0 }}>Try adjusting your search or add a new document</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          {paginated.map((doc, i) => {
            const avatar = avatarColors[i % avatarColors.length];
            const isActive = doc.status === true || doc.status === "true" || doc.status === "active";
            const kind = getKind(doc.file);
            const expiry = expiryStatus(doc.expiryDate);
            const menuOpen = openMenuId === doc._id;

            return (
              <div
                key={doc._id}
                onClick={() => onEdit?.(doc)}
                style={{
                  position: "relative",
                  background: "#fff",
                  border: "1.5px solid #d1fae5",
                  borderRadius: 14,
                  padding: 16,
                  cursor: onEdit ? "pointer" : "default",
                  boxShadow: "0 2px 10px rgba(16,185,129,.04)",
                  transition: "box-shadow .15s, transform .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(16,185,129,.12)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(16,185,129,.04)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* 3-dot menu, top-right */}
                <div
                  ref={menuOpen ? menuRef : undefined}
                  style={{ position: "absolute", top: 10, right: 10 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setOpenMenuId(menuOpen ? null : doc._id!)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: "1px solid transparent",
                      background: menuOpen ? "#f0fdf4" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#64748b",
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {menuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: 32,
                        right: 0,
                        background: "#fff",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: 10,
                        boxShadow: "0 10px 30px rgba(15,23,42,.12)",
                        minWidth: 140,
                        overflow: "hidden",
                        zIndex: 20,
                      }}
                    >
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          (onView ?? onEdit)?.(doc);
                        }}
                        style={menuItemStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Eye size={14} color="#059669" /> View
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          onDelete?.(doc);
                        }}
                        style={{ ...menuItemStyle, color: "#dc2626" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Trash2 size={14} color="#dc2626" /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* top row: thumbnail + name/type */}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingRight: 26 }}>
                  <DocThumb file={doc.file} kind={kind} />
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                        fontSize: 14,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={doc.documentName}
                    >
                      {doc.documentName}
                    </p>
                    {doc.documentType && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: 4,
                          fontSize: 10.5,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          color: avatar.color,
                          background: avatar.bg,
                          padding: "2px 8px",
                          borderRadius: 99,
                        }}
                      >
                        {doc.documentType}
                      </span>
                    )}
                  </div>
                </div>

                {/* document number */}
                {doc.documentNumber && (
                  <code
                    style={{
                      display: "inline-block",
                      marginTop: 12,
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      padding: "3px 10px",
                      fontSize: 12,
                      fontFamily: "monospace",
                      color: "#475569",
                    }}
                  >
                    {doc.documentNumber}
                  </code>
                )}

                {/* dates */}
                {(doc.issueDate || doc.expiryDate) && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 10,
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    <CalendarDays size={13} color="#94a3b8" />
                    {doc.issueDate && <span>{new Date(doc.issueDate).toLocaleDateString()}</span>}
                    {doc.issueDate && doc.expiryDate && <span style={{ color: "#cbd5e1" }}>→</span>}
                    {doc.expiryDate && <span>{new Date(doc.expiryDate).toLocaleDateString()}</span>}
                  </div>
                )}

                {/* footer badges: active/inactive + expiry */}
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: isActive ? "#dcfce7" : "#fef2f2",
                      color: isActive ? "#15803d" : "#dc2626",
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 99,
                      border: `1px solid ${isActive ? "#86efac" : "#fca5a5"}`,
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: isActive ? "#16a34a" : "#dc2626",
                      }}
                    />
                    {isActive ? "Active" : "Inactive"}
                  </span>

                  {expiry && (
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: 99,
                        background: expiry.bg,
                        color: expiry.color,
                        border: `1px solid ${expiry.border}`,
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                      }}
                    >
                      {expiry.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination footer */}
      {/* <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          border: "1.5px solid #d1fae5",
          borderRadius: 12,
          marginTop: 16,
          background: "#f8fffe",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>Cards per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            style={{
              border: "1.5px solid #d1fae5",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 13,
              color: "#0f172a",
              background: "#fff",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>
            {filtered.length === 0
              ? "0"
              : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)}`}{" "}
            of {filtered.length}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <PagBtn onClick={() => setPage(1)} disabled={page === 1} label="«" />
          <PagBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1} label="‹" />
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} style={{ padding: "0 4px", color: "#94a3b8", fontSize: 13 }}>
                  …
                </span>
              ) : (
                <PagBtn
                  key={p}
                  onClick={() => setPage(p as number)}
                  disabled={false}
                  active={page === p}
                  label={String(p)}
                />
              )
            )}
          <PagBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} label="›" />
          <PagBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} label="»" />
        </div>
      </div> */}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  padding: "9px 14px",
  fontSize: 13,
  fontWeight: 600,
  color: "#334155",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
};

function PagBtn({
  onClick,
  disabled,
  label,
  active,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: "1.5px solid",
        borderColor: active ? "#059669" : "#d1fae5",
        background: active ? "linear-gradient(135deg, #059669, #0891b2)" : "#fff",
        color: active ? "#fff" : disabled ? "#cbd5e1" : "#334155",
        fontSize: 13,
        fontWeight: active ? 700 : 400,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .15s",
      }}
    >
      {label}
    </button>
  );
}
