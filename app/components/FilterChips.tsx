import { XIcon } from "lucide-react";
import { ChipCount, chipVariants } from "~/components/Chip";
import { Button } from "~/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { cn } from "~/util/ui/utils";

export type FilterChipOption<T extends string> = {
  value: T;
  label: string;
  /** Shown as a small counter next to the label, e.g. how many results it matches. */
  count?: number;
};

/**
 * A row of toggle chips for narrowing a list down, e.g. by category.
 *
 * Several can be on at once; for a one-at-a-time pick, pass a single selected
 * value and swap it in `onToggle`. `scroll` keeps the chips on one line that
 * scrolls sideways (good on phones) instead of wrapping.
 */
export function FilterChips<T extends string>({
  options,
  selectedValues,
  onToggle,
  onClear,
  ariaLabel,
  scroll = false,
  className,
}: {
  options: readonly FilterChipOption<T>[];
  selectedValues: T[];
  onToggle: (value: T) => void;
  onClear?: () => void;
  ariaLabel: string;
  scroll?: boolean;
  className?: string;
}) {
  if (options.length === 0) return null;

  return (
    <ToggleGroup
      type="multiple"
      aria-label={ariaLabel}
      spacing={2}
      value={selectedValues}
      onValueChange={(next) => {
        // Radix reports the whole new selection; callers only care which chip
        // was tapped.
        const toggled =
          next.find((value) => !selectedValues.includes(value as T)) ??
          selectedValues.find((value) => !next.includes(value));
        if (toggled) onToggle(toggled as T);
      }}
      className={cn(
        scroll ? "w-auto flex-nowrap overflow-x-auto" : "flex-wrap",
        className,
      )}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={cn(
            chipVariants({ variant: "selectable", size: "md" }),
            // Undo the plain toggle's square, grey look.
            "rounded-full hover:bg-card data-[state=on]:bg-emerald-50",
          )}
        >
          {option.label}
          {option.count !== undefined && <ChipCount>{option.count}</ChipCount>}
        </ToggleGroupItem>
      ))}

      {onClear && selectedValues.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="rounded-full text-muted-foreground"
        >
          <XIcon />
          Clear
        </Button>
      )}
    </ToggleGroup>
  );
}
