"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  UploadCloud,
  X,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileIcon,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx"; // npm i xlsx  -> used for XLSX/CSV table preview

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FileKind = "image" | "pdf" | "doc" | "sheet" | "zip" | "other";

export interface ExistingFile {
  id?: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
}

interface FileItem {
  id: string;
  name: string;
  size?: number;
  url: string;
  kind: FileKind;
  existing: boolean;
  raw?: File;
}

interface FileUploadProps {
  label?: string;
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;
  existingFiles?: ExistingFile[];
  onChange?: (files: FileItem[]) => void;
  showDownload?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatSize = (bytes?: number) => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const getExt = (name = "") => name.split(".").pop()?.toLowerCase() || "";

const getKind = (fileLike: { name?: string; type?: string }): FileKind => {
  const name = fileLike.name || "";
  const type = fileLike.type || "";
  const ext = getExt(name);
  if (type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return "image";
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext) || type.includes("word")) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext) || type.includes("sheet")) return "sheet";
  if (["zip", "rar", "7z"].includes(ext)) return "zip";
  return "other";
};

const KIND_META: Record<
  FileKind,
  { icon: typeof FileText; label: string; tint: string; iconColor: string }
> = {
  image: { icon: ImageIcon, label: "Image", tint: "bg-teal-50", iconColor: "text-teal-600" },
  pdf: { icon: FileText, label: "PDF document", tint: "bg-rose-50", iconColor: "text-rose-500" },
  doc: { icon: FileText, label: "Word document", tint: "bg-sky-50", iconColor: "text-sky-600" },
  sheet: {
    icon: FileSpreadsheet,
    label: "Spreadsheet",
    tint: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  zip: { icon: FileIcon, label: "Archive", tint: "bg-amber-50", iconColor: "text-amber-600" },
  other: { icon: FileIcon, label: "File", tint: "bg-slate-100", iconColor: "text-slate-500" },
};

let uidCounter = 0;
const uid = () => `f_${Date.now()}_${uidCounter++}`;



// ---------------------------------------------------------------------------
// FileUpload — the reusable component
// ---------------------------------------------------------------------------

export default function FileUpload({
  label = "Documents",
  multiple = false,
  accept = ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip",
  maxSizeMB = 10,
  existingFiles = [],
  onChange,
  showDownload = true,
}: FileUploadProps) {
  const [items, setItems] = useState<FileItem[]>(() =>
    existingFiles.map((f) => ({
      id: f.id || uid(),
      name: f.name,
      size: f.size,
      url: f.url,
      kind: getKind(f),
      existing: true,
    }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerItem, setViewerItem] = useState<FileItem | null>(null); // 👈 works for ALL kinds now
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    onChange?.(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    return () => {
      items.forEach((it) => {
        if (!it.existing && it.url) URL.revokeObjectURL(it.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback(
    (fileList: FileList) => {
      const incoming = Array.from(fileList);
      const maxBytes = maxSizeMB * 1024 * 1024;
      const accepted: FileItem[] = [];
      let rejected = 0;

      incoming.forEach((file) => {
        if (file.size > maxBytes) {
          rejected += 1;
          return;
        }
        accepted.push({
          id: uid(),
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
          kind: getKind(file),
          existing: false,
          raw: file,
        });
      });

      if (rejected > 0) {
        setError(
          `${rejected} file${rejected > 1 ? "s" : ""} skipped — over the ${maxSizeMB} MB limit.`
        );
        setTimeout(() => setError(null), 4000);
      } else {
        setError(null);
      }

      setItems((prev) => {
        if (!multiple) {
          prev.forEach((p) => !p.existing && p.url && URL.revokeObjectURL(p.url));
          return accepted.slice(0, 1);
        }
        return [...prev, ...accepted];
      });
    },
    [maxSizeMB, multiple]
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) setIsDragging(false);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target && !target.existing && target.url) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const removeAll = () => {
    items.forEach((it) => !it.existing && it.url && URL.revokeObjectURL(it.url));
    setItems([]);
  };

  return (
    <div className="col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </label>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
              {items.length} file{items.length > 1 ? "s" : ""}
            </span>
          )}
          {items.length > 0 && (
            <button
              type="button"
              onClick={removeAll}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-red-500"
            >
              <Trash2 size={12} /> Remove all
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center transition ${isDragging
              ? "border-teal-500 bg-teal-50"
              : "border-slate-300 bg-slate-50 hover:border-slate-400"
            }`}
        >
          <div
            className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full transition ${isDragging ? "bg-teal-600" : "bg-white border border-slate-200"
              }`}
          >
            <UploadCloud size={18} className={isDragging ? "text-white" : "text-slate-400"} />
          </div>
          <p className="text-sm font-medium text-slate-700">
            Drop files here or <span className="text-teal-600">click to browse</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {accept.replace(/\./g, "").toUpperCase()} • Max {maxSizeMB} MB
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            hidden
            onChange={handleInputChange}
          />
        </div>

        {/* Error toast */}
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* File grid */}
        {items.length > 0 && (
          <div
            className="mt-4 grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
          >
            {items.map((item) => (
              <FileCard
                key={item.id}
                item={item}
                showDownload={showDownload}
                onRemove={() => removeItem(item.id)}
                onView={() => setViewerItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Universal viewer — image, pdf, sheet(xlsx/csv), doc, other */}
      {viewerItem && (
        <FileViewer item={viewerItem} onClose={() => setViewerItem(null)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileCard — single card renderer, switches preview by kind
// ---------------------------------------------------------------------------

function FileCard({
  item,
  showDownload,
  onRemove,
  onView,
}: {
  item: FileItem;
  showDownload: boolean;
  onRemove: () => void;
  onView: () => void;
}) {
  const meta = KIND_META[item.kind];
  const Icon = meta.icon;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:shadow-md">
      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -right-1 -top-1 z-10 rounded-full bg-red-500 p-1 text-white opacity-0 shadow transition hover:bg-red-600 group-hover:opacity-100"
        title="Remove"
      >
        <X size={12} />
      </button>

      {/* Preview area — clicking it opens the universal viewer for ANY file kind */}
      <div
        onClick={onView}
        className={`relative flex h-24 w-full cursor-pointer items-center justify-center ${item.kind === "image" ? "bg-slate-100" : meta.tint
          }`}
      >
        {item.kind === "image" ? (
          <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
        ) : item.kind === "pdf" ? (
          <PdfThumb url={item.url} iconColor={meta.iconColor} />
        ) : (
          <Icon size={26} className={meta.iconColor} strokeWidth={1.6} />
        )}

        {item.existing && (
          <span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
            Uploaded
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 px-3 py-2.5">
        <p className="truncate text-xs font-semibold text-slate-700" title={item.name}>
          {item.name}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {formatSize(item.size)} · {meta.label}
          </span>
          <div className="flex items-center gap-2">
            {/* View button now shows for EVERY file kind, not just images */}
            <button type="button" onClick={onView} title="View">
              <Eye size={13} className="text-slate-400 hover:text-teal-600" />
            </button>
            {showDownload && (
              <a
                href={item.url}
                download={item.name}
                title="Download"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={13} className="text-slate-400 hover:text-teal-600" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tiny inline PDF thumbnail for the card (muted, non-interactive)
function PdfThumb({ url, iconColor }: { url: string; iconColor: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <FileText size={26} className={iconColor} strokeWidth={1.6} />;
  return (
    <object
      data={`${url}#toolbar=0&navpanes=0&view=FitH`}
      type="application/pdf"
      className="pointer-events-none h-full w-full"
      onError={() => setFailed(true)}
    >
      <FileText size={26} className={iconColor} strokeWidth={1.6} />
    </object>
  );
}

// ---------------------------------------------------------------------------
// FileViewer — full modal, renders the right preview for EVERY file kind
// ---------------------------------------------------------------------------

function FileViewer({ item, onClose }: { item: FileItem; onClose: () => void }) {
  const meta = KIND_META[item.kind];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className={`rounded-md p-1.5 ${meta.tint}`}>
              <meta.icon size={16} className={meta.iconColor} />
            </span>
            <p className="truncate text-sm font-semibold text-slate-700" title={item.name}>
              {item.name}
            </p>
          </div>
          <div className="flex items-center gap-3 pl-3">
            <a
              href={item.url}
              download={item.name}
              className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-teal-700"
            >
              <Download size={13} /> Download
            </a>
            <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100">
              <X size={16} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {item.kind === "image" && (
            <div className="flex h-full items-center justify-center p-4">
              <img
                src={item.url}
                alt={item.name}
                className="max-h-[70vh] max-w-full rounded-lg object-contain shadow"
              />
            </div>
          )}

          {item.kind === "pdf" && (
            <object
              data={`${item.url}#toolbar=1`}
              type="application/pdf"
              className="h-[75vh] w-full"
            >
              <p className="p-6 text-sm text-slate-500">
                PDF preview not supported here — use Download to view the file.
              </p>
            </object>
          )}

          {item.kind === "sheet" && <SheetViewer item={item} />}

          {(item.kind === "doc" || item.kind === "zip" || item.kind === "other") && (
            <FallbackViewer item={item} meta={meta} />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SheetViewer — parses XLSX/CSV client-side and renders a real table
// ---------------------------------------------------------------------------

function SheetViewer({ item }: { item: FileItem }) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const parse = async () => {
      try {
        const ext = getExt(item.name);
        let wb: XLSX.WorkBook;

        if (item.raw) {
          // freshly picked file — read directly from the File object
          if (ext === "csv") {
            const text = await item.raw.text();
            wb = XLSX.read(text, { type: "string" });
          } else {
            const buffer = await item.raw.arrayBuffer();
            wb = XLSX.read(buffer, { type: "array" });
          }
        } else {
          // existing/server file — fetch it first (needs CORS access on that URL)
          const res = await fetch(item.url);
          const buffer = await res.arrayBuffer();
          wb = XLSX.read(buffer, { type: "array" });
        }

        if (cancelled) return;
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
      } catch (err) {
        if (!cancelled) setError("Couldn't read this file for preview. Try downloading it instead.");
      }
    };

    parse();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  useEffect(() => {
    if (!workbook || !sheetNames[activeSheet]) return;
    const sheet = workbook.Sheets[sheetNames[activeSheet]];
    const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, blankrows: false });
    setRows(data.map((r) => r.map((c) => (c == null ? "" : String(c)))));
  }, [workbook, sheetNames, activeSheet]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
        <AlertCircle size={22} className="text-red-400" />
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  if (!rows) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" /> Reading spreadsheet…
      </div>
    );
  }

  const header = rows[0] || [];
  const body = rows.slice(1, 201); // cap preview at 200 rows for performance

  return (
    <div className="flex h-full flex-col">
      {/* sheet tabs, only shown if the workbook has more than one sheet */}
      {sheetNames.length > 1 && (
        <div className="flex gap-1 border-b border-slate-200 bg-white px-3 pt-2">
          {sheetNames.map((name, i) => (
            <button
              key={name}
              onClick={() => setActiveSheet(i)}
              className={`rounded-t-md px-3 py-1.5 text-xs font-medium transition ${i === activeSheet
                  ? "bg-slate-50 text-teal-700 border border-b-0 border-slate-200"
                  : "text-slate-400 hover:text-slate-600"
                }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto p-3">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {header.map((h, i) => (
                <th
                  key={i}
                  className="sticky top-0 border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-left font-semibold text-slate-600"
                >
                  {h || `Column ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri} className={ri % 2 ? "bg-white" : "bg-slate-50/50"}>
                {header.map((_, ci) => (
                  <td key={ci} className="border border-slate-200 px-2.5 py-1.5 text-slate-600">
                    {r[ci] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length - 1 > 200 && (
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Showing first 200 of {rows.length - 1} rows — download the file to see all of it.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FallbackViewer — for doc/docx/zip/other where no in-browser render exists.
// For existing files with a public URL we try Google's Office viewer;
// freshly-picked (blob:) files can't be viewed this way, so we just prompt download.
// ---------------------------------------------------------------------------

function FallbackViewer({
  item,
  meta,
}: {
  item: FileItem;
  meta: (typeof KIND_META)[FileKind];
}) {
  const Icon = meta.icon;
  const canUseOfficeViewer = item.existing && /^https?:\/\//.test(item.url) && item.kind === "doc";

  if (canUseOfficeViewer) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(item.url)}`}
        className="h-[75vh] w-full"
        title={item.name}
      />
    );
  }

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-3 p-10 text-center">
      <span className={`flex h-14 w-14 items-center justify-center rounded-full ${meta.tint}`}>
        <Icon size={26} className={meta.iconColor} />
      </span>
      <p className="text-sm font-medium text-slate-600">
        No in-browser preview for this file type yet.
      </p>
      <p className="text-xs text-slate-400">Download it to open in the right app.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo — mirrors the ImageUpload usage pattern in a form
// ---------------------------------------------------------------------------

export function FileUploadDemo() {
  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-10">
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
            Employee Onboarding
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-800">
            Upload identity & qualification documents
          </h2>
        </div>

        <FileUpload
          label="Documents"
          multiple
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv"
          maxSizeMB={5}
          existingFiles={[
            {
              id: "srv1",
              name: "offer-letter.pdf",
              url: "https://upload.wikimedia.org/wikipedia/commons/2/2c/PDF_icon.svg",
              size: 240 * 1024,
              type: "application/pdf",
            },
          ]}
        />
      </div>
    </div>
  );
}