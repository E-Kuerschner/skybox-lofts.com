import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderArchiveIcon,
  ImageIcon,
  PresentationIcon,
  type LucideIcon,
} from "lucide-react";
import type { FileKind } from "./documents";

const ICONS: Record<FileKind, LucideIcon> = {
  document: FileTextIcon,
  spreadsheet: FileSpreadsheetIcon,
  slideshow: PresentationIcon,
  image: ImageIcon,
  archive: FolderArchiveIcon,
  other: FileIcon,
};

/** A file's icon, picked by its broad kind rather than its exact ending. */
export function FileTypeIcon({
  kind,
  className,
}: {
  kind: FileKind;
  className?: string;
}) {
  const Icon = ICONS[kind];
  return <Icon className={className} aria-hidden />;
}
