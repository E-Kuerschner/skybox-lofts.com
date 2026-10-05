import type { LucideIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/util/ui/utils";

type ActionButtonProps = Omit<React.ComponentProps<typeof Button>, "size"> &
  (
    | { icon?: undefined; label?: undefined; children: React.ReactNode }
    | {
        /** Show just this icon in a square button, e.g. "+" next to a list on phones. */
        icon: LucideIcon;
        /** Spoken by screen readers and shown on hover, since there's no visible text. */
        label: string;
        children?: never;
      }
  );

/**
 * The app's main tappable button, with soft square corners: the Cancel and
 * Save buttons at the bottom of a dialog, or the add/invite button that
 * stands in for a labelled one on phones.
 *
 * Pass `icon` and `label` instead of children for the square, icon-only
 * version. Use this rather than styling a `Button` by hand so every primary
 * action keeps the same shape.
 */
export function ActionButton({
  icon: Icon,
  label,
  variant = "outline",
  className,
  children,
  ...props
}: ActionButtonProps) {
  const iconOnly = Icon !== undefined;

  return (
    <Button
      variant={variant}
      size={iconOnly ? "icon" : "default"}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-xl",
        iconOnly ? "size-10 md:size-10" : "h-11 md:h-11",
        // The cta variant lifts on hover, which looks out of place in a row
        // of buttons.
        variant === "cta" &&
          "shadow-none hover:translate-y-0 hover:shadow-none",
        className,
      )}
      {...props}
    >
      {iconOnly ? <Icon /> : children}
    </Button>
  );
}
