import type { LucideIcon } from "lucide-react";
import { cn } from "~/util/ui/utils";

/**
 * How something went or where it stands, using the status colors in app.css:
 *
 * - positive: done or went well, e.g. "Verified", "Message sent".
 * - warning: waiting or needs a look, e.g. "Invite pending".
 * - error: went wrong, e.g. a failed save.
 */
export type StatusTone = "positive" | "warning" | "error";

const toneClasses: Record<StatusTone, string> = {
  positive: "bg-positive text-positive-foreground border-positive-border",
  warning: "bg-warning text-warning-foreground border-warning-border",
  error: "bg-error text-error-foreground border-error-border",
};

/**
 * A tinted box that tells someone about a situation, e.g. "5 people haven't
 * accepted their invite yet", optionally with buttons to deal with it.
 *
 * It stays put until whatever it describes changes. For a quick "that worked"
 * or "that failed" after an action, use `StatusBanner`, which is built on this
 * and can fade away on its own.
 */
export function Callout({
  tone,
  icon: Icon,
  title,
  actions,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  tone: StatusTone;
  /** Shown at the start, on screens wider than a phone. */
  icon?: LucideIcon;
  /** A short bold line above the rest. */
  title?: React.ReactNode;
  /** Buttons at the end; they wrap below the text when space runs out. */
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border p-4 text-sm",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="hidden size-5 shrink-0 sm:block" />}
      <div className="flex min-w-0 flex-[1_1_18rem] flex-col gap-0.5">
        {title && <p className="text-[15px] font-semibold">{title}</p>}
        {children && (
          <div className={cn(title && "opacity-90")}>{children}</div>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
