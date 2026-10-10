import { UserRoundIcon } from "lucide-react";
import { cn } from "~/util/ui/utils";

/** The first letters of someone's first and last names, e.g. "DW". */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * A round badge with someone's initials, standing in for a photo. Without a
 * name, e.g. an open board seat, it's an empty dashed circle instead.
 *
 * It's decorative: always show the person's name next to it, which is what
 * screen readers announce. Resize it with a `size-*` class.
 */
export function Avatar({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) {
  const initials = name ? initialsOf(name) : "";

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold select-none",
        initials
          ? "bg-highlight-surface text-highlight-foreground"
          : "border border-dashed text-muted-foreground",
        className,
      )}
    >
      {initials || <UserRoundIcon className="size-4" />}
    </span>
  );
}
