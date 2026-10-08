import { useEffect, useRef, useState } from "react";
import { FileTextIcon, UploadIcon, XIcon } from "lucide-react";
import { CrudFormDialog } from "~/components/crud/CrudFormDialog";
import { IconButton } from "~/components/IconButton";
import { RadioCards } from "~/components/RadioCards";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/util/ui/utils";
import {
  ACCEPTED_DOCUMENT_TYPES,
  DOCUMENT_CATEGORIES,
  MAX_DOCUMENT_SIZE,
  formatFileSize,
  splitExtension,
  suggestDisplayName,
  type DocumentCategory,
} from "./documents";

type DocumentUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess?: (message: string) => void;
};

export function DocumentUploadDialog({
  open,
  onOpenChange,
  onUploadSuccess,
}: DocumentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState<DocumentCategory | null>(null);

  // Start fresh each time it opens
  useEffect(() => {
    if (!open) {
      setFile(null);
      setDisplayName("");
      setCategory(null);
    }
  }, [open]);

  const handleFileChange = (next: File | null) => {
    setFile(next);
    setDisplayName(next ? suggestDisplayName(next.name) : "");
  };

  const isTooBig = file !== null && file.size > MAX_DOCUMENT_SIZE;

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="create"
      entityName="document"
      action="/documentUpload"
      title="Upload a document"
      description="Every resident will be able to see and download it."
      hasFileUploads
      submitLabel="Upload document"
      pendingLabel="Uploading..."
      submitDisabled={
        !file || isTooBig || !category || displayName.trim() === ""
      }
      onSuccess={onUploadSuccess}
    >
      <FileField file={file} isTooBig={isTooBig} onChange={handleFileChange} />

      {file && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="document-name">Name residents will see</Label>
          <Input
            id="document-name"
            name="displayName"
            className="h-10 bg-card"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            suffix={splitExtension(file.name).extension.toLowerCase() || null}
            required
          />
          <p className="text-[0.8125rem] text-muted-foreground">
            We filled this in from the file. Change it to something clear, like
            “Rules and Regulations”.
          </p>
        </div>
      )}

      <RadioCards
        name="category"
        legend="Where should it go?"
        options={DOCUMENT_CATEGORIES.map((c) => ({ ...c }))}
        value={category}
        onValueChange={setCategory}
        required
      />
    </CrudFormDialog>
  );
}

/**
 * Drop a file or pick one. A single file input (always mounted, so it's what
 * the form posts) sits behind both, and once there's a file it's shown as a
 * card that can be cleared to pick again.
 */
function FileField({
  file,
  isTooBig,
  onChange,
}: {
  file: File | null;
  isTooBig: boolean;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const clear = () => {
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const dropped = e.dataTransfer.files;
    if (!dropped.length || !inputRef.current) return;
    // Keep only the first file, and put it in the input so the form posts it
    const transfer = new DataTransfer();
    transfer.items.add(dropped[0]);
    inputRef.current.files = transfer.files;
    onChange(dropped[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium" id="document-file-label">
        File
      </span>
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept={ACCEPTED_DOCUMENT_TYPES}
        className="sr-only"
        aria-labelledby="document-file-label"
        tabIndex={-1}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border py-3 pr-2 pl-3.5",
            isTooBig
              ? "border-error-border bg-error"
              : "border-positive-border bg-positive",
          )}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-card text-positive-foreground">
            <FileTextIcon className="size-4.5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium" title={file.name}>
              {file.name}
            </span>
            <span
              className={cn(
                "text-[0.8125rem]",
                isTooBig
                  ? "text-error-foreground"
                  : "text-positive-foreground",
              )}
            >
              {formatFileSize(file.size)} ·{" "}
              {isTooBig
                ? `Too big. Files can be up to ${formatFileSize(MAX_DOCUMENT_SIZE)}.`
                : "Ready to upload"}
            </span>
          </div>
          <IconButton
            type="button"
            icon={XIcon}
            label="Choose a different file"
            onClick={clear}
          />
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed border-muted-foreground/40 bg-subtle px-4 py-7 text-center transition-colors",
            isDraggingOver && "border-ring bg-positive",
          )}
        >
          <UploadIcon
            className="size-7 text-muted-foreground"
            strokeWidth={1.75}
          />
          <span className="text-sm">Drag a file here, or</span>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-[10px] bg-card"
            onClick={() => inputRef.current?.click()}
          >
            Choose a file
          </Button>
          <span className="text-[0.8125rem] text-muted-foreground">
            PDF, Word or Excel, up to {formatFileSize(MAX_DOCUMENT_SIZE)}
          </span>
        </div>
      )}
    </div>
  );
}
