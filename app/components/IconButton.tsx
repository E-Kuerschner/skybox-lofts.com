import type { LucideIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/util/ui/utils";

/**
 * A small, quiet button that's just an icon, e.g. Edit and Remove on a card.
 *
 * `label` is required: it's what screen readers announce and what shows on
 * hover, since there's no visible text. `destructive` turns it red on hover
 * so a delete never looks like an ordinary action.
 */
export function IconButton({
  icon: Icon,
  label,
  tone = "neutral",
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children" | "size" | "variant"> & {
  icon: LucideIcon;
  label: string;
  tone?: "neutral" | "destructive";
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      className={cn(
        "size-8 md:size-8 text-muted-foreground",
        tone === "destructive" &&
          "hover:bg-destructive/10 hover:text-destructive",
        className,
      )}
      {...props}
    >
      <Icon />
    </Button>
  );
}
