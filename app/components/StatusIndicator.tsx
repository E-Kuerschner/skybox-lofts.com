import type { StatusTone } from "~/components/Callout";
import { cn } from "~/util/ui/utils";

const toneClasses: Record<StatusTone, { text: string; dot: string }> = {
  positive: { text: "text-positive-foreground", dot: "bg-positive-foreground" },
  warning: { text: "text-warning-foreground", dot: "bg-warning-foreground" },
  error: { text: "text-error-foreground", dot: "bg-error-foreground" },
};

/**
 * A small colored dot with a word next to it, for where something stands,
 * e.g. "Verified" or "Invite pending" in a table cell.
 *
 * The word carries the meaning; the color only backs it up, so it still
 * reads for people who can't tell the colors apart.
 */
export function StatusIndicator({
  tone,
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { tone: StatusTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        toneClasses[tone].text,
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn("size-2 shrink-0 rounded-full", toneClasses[tone].dot)}
      />
      {children}
    </span>
  );
}
