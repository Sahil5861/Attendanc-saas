export type DocumentFile = File | string | null | undefined;

const uploadsBase =
  process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "/uploads").replace(/\/$/, "") ||
  "";

export function resolveDocumentUrl(file: DocumentFile, fileName?: string | null) {
  const value = typeof file === "string" && file ? file : fileName || "";

  if (!value) return null;
  if (/^(https?:|blob:|data:)/i.test(value)) return value;

  const normalized = value.replace(/\\/g, "/").replace(/^\/+/, "");
  const uploadsPath = normalized.startsWith("uploads/")
    ? normalized.replace(/^uploads\//, "")
    : normalized.startsWith("documents/")
      ? normalized
      : `documents/${normalized}`;

  return uploadsBase ? `${uploadsBase}/${uploadsPath}` : `/uploads/${uploadsPath}`;
}

export function documentDisplayName(file: DocumentFile, fallback?: string | null) {
  if (file instanceof File) return file.name;

  const value = typeof file === "string" && file ? file : fallback || "";
  if (!value) return "No file attached";

  return value.split("?")[0].split("/").pop() || "document";
}
