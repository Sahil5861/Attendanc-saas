"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileIcon,
  AlertCircle,
  Loader2,
  CalendarDays,
} from "lucide-react";
import * as XLSX from "xlsx"; // npm i xlsx
import { EmployeeDocument } from "./modal";
import { documentDisplayName, resolveDocumentUrl } from "./fileUrl";

interface Props {
  document: EmployeeDocument | null; // null = closed
  onClose: () => void;
}

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

const KIND_META: Record<FileKind, { icon: typeof FileText; bg: string; color: string; label: string }> = {
  image: { icon: ImageIcon, bg: "#ecfeff", color: "#0e7490", label: "Image" },
  pdf: { icon: FileText, bg: "#fef2f2", color: "#dc2626", label: "PDF document" },
  doc: { icon: FileText, bg: "#eff6ff", color: "#2563eb", label: "Word document" },
  sheet: { icon: FileSpreadsheet, bg: "#f0fdf4", color: "#16a34a", label: "Spreadsheet" },
  other: { icon: FileIcon, bg: "#f8fafc", color: "#64748b", label: "File" },
};

export default function DocumentViewModal({ document, onClose }: Props) {
  const url = useMemo(() => {
    if (!document) return null;
    return document.file instanceof File
      ? URL.createObjectURL(document.file)
      : resolveDocumentUrl(document.file, document.fileName);
  }, [document]);

  useEffect(() => {
    return () => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [url]);

  if (!document) return null;

  const kind = getKind(document.file);
  const meta = KIND_META[kind];
  const name = documentDisplayName(document.file, document.originalName || document.fileName);
  

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        padding: "20px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 820,
          maxHeight: "88vh",
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 24px 60px rgba(0,0,0,.18)",
          border: "1.5px solid #d1fae5",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 22px",
            borderBottom: "1.5px solid #d1fae5",
            background: "#f8fffe",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: meta.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <meta.icon size={16} color={meta.color} />
            </span>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#0f172a",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {document.documentName || "Document"}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{name}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {url && (
              <a
                href={url}
                download={name}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "linear-gradient(135deg, #059669, #0891b2)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "7px 14px",
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                <Download size={13} /> Download
              </a>
            )}
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1.5px solid #d1fae5",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={16} color="#64748b" />
            </button>
          </div>
        </div>

        {/* body: preview + meta */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "auto" }}>
          {/* preview area */}
          <div style={{ background: "#f8fafc", minHeight: 220 }}>
            {!url ? (
              <EmptyState />
            ) : kind === "image" ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
                <img
                  src={url}
                  alt={name}
                  style={{ maxHeight: "50vh", maxWidth: "100%", borderRadius: 10, objectFit: "contain" }}
                />
              </div>
            ) : kind === "pdf" ? (
              <object data={`${url}#toolbar=1`} type="application/pdf" style={{ width: "100%", height: "55vh" }}>
                <FallbackNote text="PDF preview not supported here — use Download to view the file." />
              </object>
            ) : kind === "sheet" ? (
              <SheetPreview file={document.file} />
            ) : (
              <DocFallback kind={kind} meta={meta} url={url} />
            )}
          </div>

          {/* meta details */}
          <div style={{ padding: "18px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <MetaField label="Document Type" value={document.documentType || "—"} />
            <MetaField label="Document Number" value={document.documentNumber || "—"} />
            <MetaField
              label="Issue Date"
              value={document.issueDate ? new Date(document.issueDate).toLocaleDateString() : "—"}
              icon
            />
            <MetaField
              label="Expiry Date"
              value={document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : "—"}
              icon
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaField({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div>
      <p
        style={{
          margin: "0 0 4px",
          fontSize: 10.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#94a3b8",
        }}
      >
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#0f172a", fontWeight: 600 }}>
        {icon && <CalendarDays size={13} color="#94a3b8" />}
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 50, gap: 8 }}>
      <FileIcon size={26} color="#cbd5e1" />
      <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>No file attached to this document</p>
    </div>
  );
}

function FallbackNote({ text }: { text: string }) {
  return <p style={{ padding: 24, fontSize: 13, color: "#94a3b8", textAlign: "center" }}>{text}</p>;
}

function DocFallback({
  kind,
  meta,
  url,
}: {
  kind: FileKind;
  meta: (typeof KIND_META)[FileKind];
  url: string;
}) {
  const canUseOfficeViewer = /^https?:\/\//.test(url) && kind === "doc";

  if (canUseOfficeViewer) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
        style={{ width: "100%", height: "55vh", border: "none" }}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 50, gap: 10 }}>
      <span
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: meta.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <meta.icon size={22} color={meta.color} />
      </span>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", margin: 0 }}>
        No in-browser preview for this file type.
      </p>
      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Use Download above to open it.</p>
    </div>
  );
}

// Excel / CSV → real table preview, parsed client-side with the "xlsx" package
function SheetPreview({ file }: { file: File | string | null }) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const parse = async () => {
      try {
        if (!file) throw new Error("no file");
        const ext = getExt(typeof file === "string" ? file : file.name);
        let wb: XLSX.WorkBook;

        if (file instanceof File) {
          if (ext === "csv") {
            const text = await file.text();
            wb = XLSX.read(text, { type: "string" });
          } else {
            const buffer = await file.arrayBuffer();
            wb = XLSX.read(buffer, { type: "array" });
          }
        } else {
          const res = await fetch(file); // existing server file — needs CORS access
          const buffer = await res.arrayBuffer();
          wb = XLSX.read(buffer, { type: "array" });
        }

        if (cancelled) return;
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, blankrows: false });
        setRows(data.map((r) => r.map((c) => (c == null ? "" : String(c)))));
      } catch {
        if (!cancelled) setError("Couldn't read this file for preview. Try downloading it instead.");
      }
    };

    parse();
    return () => {
      cancelled = true;
    };
  }, [file]);

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 50, gap: 8 }}>
        <AlertCircle size={22} color="#f87171" />
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{error}</p>
      </div>
    );
  }

  if (!rows) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 50, fontSize: 13, color: "#94a3b8" }}>
        <Loader2 size={16} className="animate-spin" /> Reading spreadsheet…
      </div>
    );
  }

  const header = rows[0] || [];
  const body = rows.slice(1, 201);

  return (
    <div style={{ maxHeight: "50vh", overflow: "auto", padding: 16 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {header.map((h, i) => (
              <th
                key={i}
                style={{
                  position: "sticky",
                  top: 0,
                  border: "1px solid #e2e8f0",
                  background: "#f1f5f9",
                  padding: "7px 10px",
                  textAlign: "left",
                  fontWeight: 700,
                  color: "#475569",
                }}
              >
                {h || `Column ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, ri) => (
            <tr key={ri} style={{ background: ri % 2 ? "#fff" : "#f8fafc" }}>
              {header.map((_, ci) => (
                <td key={ci} style={{ border: "1px solid #e2e8f0", padding: "7px 10px", color: "#475569" }}>
                  {r[ci] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length - 1 > 200 && (
        <p style={{ marginTop: 8, textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
          Showing first 200 of {rows.length - 1} rows — download the file to see all of it.
        </p>
      )}
    </div>
  );
}
