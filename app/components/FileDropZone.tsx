import { useState } from "react";
import { UploadIcon, type LucideIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/util/ui/utils";

/** Whether a file matches an `accept` list like ".pdf,image/*". */
function isAccepted(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .some((token) =>
      token.startsWith(".")
        ? name.endsWith(token)
        : token.endsWith("/*")
          ? type.startsWith(token.slice(0, -1))
          : type === token,
    );
}

/**
 * The dashed area for adding files: drag them in, or press the button to pick
 * them. Every upload in the app starts here, so it looks and works the same
 * whether it's a document or contractor photos.
 *
 * It doesn't own the file input. Keep the input mounted (usually `sr-only`)
 * in the form, so the files stay put when the zone gives way to a preview,
 * and pass its ref here. Dropped files go into that input and fire its
 * `onChange`, the same as picking them, so there's one place to handle both.
 * Files that don't match the input's `accept` are turned away with a note.
 */
export function FileDropZone({
  inputRef,
  icon: Icon = UploadIcon,
  title,
  buttonLabel,
  hint,
  className,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  icon?: LucideIcon;
  /** e.g. "Drag a file here, or". */
  title: string;
  /** e.g. "Choose a file". */
  buttonLabel: string;
  /** What's allowed, e.g. "PDF, Word or Excel, up to 10 MB". */
  hint?: React.ReactNode;
  className?: string;
}) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [wasRejected, setWasRejected] = useState(false);

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const input = inputRef.current;
    if (!input || input.disabled) return;

    const dropped = [...event.dataTransfer.files];
    const accepted = dropped.filter((file) => isAccepted(file, input.accept));
    setWasRejected(accepted.length < dropped.length);
    if (accepted.length === 0) return;

    const transfer = new DataTransfer();
    (input.multiple ? accepted : accepted.slice(0, 1)).forEach((file) =>
      transfer.items.add(file),
    );
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      // The whole area picks files on click; the button is there for
      // keyboards and for anyone who doesn't think to click a dashed box.
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed border-muted-foreground/40 bg-subtle px-4 py-7 text-center transition-colors hover:border-highlight",
        isDraggingOver && "border-highlight bg-highlight-surface",
        className,
      )}
    >
      <Icon className="size-7 text-highlight" strokeWidth={1.75} />
      <span className="text-sm">{title}</span>
      <Button
        type="button"
        variant="outline"
        className="h-9 rounded-[10px] bg-card"
        onClick={(event) => {
          event.stopPropagation();
          inputRef.current?.click();
        }}
      >
        {buttonLabel}
      </Button>
      {wasRejected ? (
        <span className="text-[0.8125rem] text-error-foreground">
          Some of those files can't be used here.{hint && " "}
          {hint}
        </span>
      ) : (
        hint && (
          <span className="text-[0.8125rem] text-muted-foreground">{hint}</span>
        )
      )}
    </div>
  );
}
