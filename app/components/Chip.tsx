import { XIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/util/ui/utils";

/**
 * The app's pill shape, in one place so tags and filter chips match.
 *
 * - `accent`: a highlighted label, e.g. the services a contractor offers.
 * - `neutral`: the same shape without the green, for labels that shouldn't
 *   compete with the page's active states.
 * - `selectable`: a chip someone can switch on and off. It reads as neutral
 *   until Radix marks it `data-state="on"`, then takes the accent look — the
 *   same "currently active" green as tabs and toggles.
 */
export const chipVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        accent: "border-emerald-300 bg-emerald-50 text-emerald-800",
        neutral: "border-border bg-muted text-foreground",
        selectable:
          "cursor-pointer border-border bg-card text-foreground hover:border-emerald-600 hover:text-emerald-700 active:scale-95 data-[state=on]:border-ring data-[state=on]:bg-emerald-50 data-[state=on]:font-semibold data-[state=on]:text-emerald-800",
      },
      size: {
        sm: "px-2.5 py-0.5 text-xs",
        md: "h-10 px-3.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "accent",
      size: "sm",
    },
  },
);

export type ChipVariantProps = VariantProps<typeof chipVariants>;

/**
 * A pill label, such as a service tag. Pass `onRemove` to give it a small ×
 * button, e.g. for something picked in a form.
 */
export function Chip({
  variant,
  size,
  onRemove,
  removeLabel,
  className,
  children,
  ...props
}: React.ComponentProps<"span"> &
  ChipVariantProps & {
    onRemove?: () => void;
    /** What the × button announces, e.g. "Remove Painting". */
    removeLabel?: string;
  }) {
  return (
    <span
      data-slot="chip"
      className={cn(
        chipVariants({ variant, size }),
        onRemove && "pr-1",
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? "Remove"}
          className="flex size-6 cursor-pointer items-center justify-center rounded-full hover:bg-foreground/5"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </span>
  );
}

/**
 * A small number inside a chip, e.g. how many results a filter matches.
 * Follows its chip into the accent color when the chip is switched on.
 */
export function ChipCount({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-xs font-normal text-muted-foreground in-data-[state=on]:text-emerald-700",
        className,
      )}
      {...props}
    />
  );
}
