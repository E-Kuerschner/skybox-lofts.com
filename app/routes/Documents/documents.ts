/** The sections documents are filed under; each is a folder in the bucket. */
export const DOCUMENT_CATEGORIES = [
  {
    value: "building-info",
    label: "Building information",
    description: "Bylaws, rules, forms and policies",
  },
  {
    value: "meeting-notes",
    label: "Meeting notes",
    description: "Notes and minutes from board and owner meetings",
  },
  {
    value: "budget",
    label: "Budget",
    description: "Budgets, reserve studies and financial reports",
  },
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]["value"];

export function isDocumentCategory(value: string): value is DocumentCategory {
  return DOCUMENT_CATEGORIES.some((category) => category.value === value);
}

export function categoryLabel(category: string): string {
  return (
    DOCUMENT_CATEGORIES.find((c) => c.value === category)?.label ?? category
  );
}

export type DocumentFile = {
  key: string;
  /** What residents see, without the file ending. */
  name: string;
  /** e.g. "PDF", "Word document". */
  typeLabel: string;
  kind: FileKind;
  /** ISO date the file was uploaded. */
  uploaded: string;
};

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export const ACCEPTED_DOCUMENT_TYPES =
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv";

/** Splits "Rules.pdf" into "Rules" and ".pdf". */
export function splitExtension(filename: string): {
  base: string;
  extension: string;
} {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0) return { base: filename, extension: "" };
  return { base: filename.slice(0, dot), extension: filename.slice(dot) };
}

/** The broad kind of file, which picks the icon shown beside it. */
export type FileKind =
  | "document"
  | "spreadsheet"
  | "slideshow"
  | "image"
  | "archive"
  | "other";

const FILE_TYPES: Record<string, { label: string; kind: FileKind }> = {
  ".pdf": { label: "PDF", kind: "document" },
  ".doc": { label: "Word document", kind: "document" },
  ".docx": { label: "Word document", kind: "document" },
  ".txt": { label: "Text file", kind: "document" },
  ".xls": { label: "Spreadsheet", kind: "spreadsheet" },
  ".xlsx": { label: "Spreadsheet", kind: "spreadsheet" },
  ".csv": { label: "Spreadsheet", kind: "spreadsheet" },
  ".ppt": { label: "Slideshow", kind: "slideshow" },
  ".pptx": { label: "Slideshow", kind: "slideshow" },
  ".jpg": { label: "Image", kind: "image" },
  ".jpeg": { label: "Image", kind: "image" },
  ".png": { label: "Image", kind: "image" },
  ".gif": { label: "Image", kind: "image" },
  ".webp": { label: "Image", kind: "image" },
  ".heic": { label: "Image", kind: "image" },
  ".zip": { label: "Zip file", kind: "archive" },
};

/**
 * What kind of file this is, from its ending: a plain-language label (e.g.
 * "Word document") and the broad kind for its icon.
 */
export function fileType(filename: string): { label: string; kind: FileKind } {
  const { extension } = splitExtension(filename);
  return (
    FILE_TYPES[extension.toLowerCase()] ?? {
      label: extension ? extension.slice(1).toUpperCase() : "File",
      kind: "other",
    }
  );
}

/**
 * A starting point for the name residents see, cleaned up from the file's
 * own name: "rules_regs_FINAL (1).pdf" becomes "rules regs FINAL".
 */
export function suggestDisplayName(filename: string): string {
  return splitExtension(filename)
    .base.replace(/\s*\(\d+\)$/, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(/\.0$/, "")} MB`;
}
