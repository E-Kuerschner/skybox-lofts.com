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

const TYPE_LABELS: Record<string, string> = {
  ".pdf": "PDF",
  ".doc": "Word document",
  ".docx": "Word document",
  ".xls": "Spreadsheet",
  ".xlsx": "Spreadsheet",
  ".csv": "Spreadsheet",
  ".ppt": "Slideshow",
  ".pptx": "Slideshow",
  ".jpg": "Image",
  ".jpeg": "Image",
  ".png": "Image",
  ".txt": "Text file",
  ".zip": "Zip file",
};

/** A plain-language name for a file's type, from its ending. */
export function fileTypeLabel(filename: string): string {
  const { extension } = splitExtension(filename);
  return (
    TYPE_LABELS[extension.toLowerCase()] ??
    (extension ? extension.slice(1).toUpperCase() : "File")
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
