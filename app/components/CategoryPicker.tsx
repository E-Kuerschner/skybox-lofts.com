import { FilterChips, type FilterChipOption } from "~/components/FilterChips";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { cn } from "~/util/ui/utils";

export type CategoryOption = FilterChipOption<string> & { count: number };

/**
 * Picks the one category a list is narrowed to, with how many items each holds.
 *
 * - `list`: a column down the side of the page (desktop). Long names are cut
 *   short with an ellipsis, full name on hover, so the counts line up.
 * - `chips`: a row of filter chips that scrolls sideways (phones).
 *
 * There's always exactly one pick: choosing the current one again goes back to
 * `allValue`.
 */
export function CategoryPicker({
  options,
  value,
  allValue,
  onValueChange,
  layout,
  ariaLabel,
  className,
}: {
  options: CategoryOption[];
  value: string;
  /** The "everything" option, which un-picking falls back to. */
  allValue: string;
  onValueChange: (value: string) => void;
  layout: "list" | "chips";
  ariaLabel: string;
  className?: string;
}) {
  if (layout === "chips") {
    return (
      <FilterChips
        options={options}
        selectedValues={[value]}
        onToggle={(next) => onValueChange(next === value ? allValue : next)}
        ariaLabel={ariaLabel}
        scroll
        className={className}
      />
    );
  }

  return (
    <ToggleGroup
      type="single"
      orientation="vertical"
      aria-label={ariaLabel}
      spacing={0.5}
      value={value}
      onValueChange={(next) => onValueChange(next || allValue)}
      className={cn(
        "w-full flex-col items-stretch rounded-xl border bg-card p-2",
        className,
      )}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          title={option.label}
          className="group h-10 w-full min-w-0 cursor-pointer justify-between rounded-lg px-3 font-normal data-[state=on]:bg-emerald-50 data-[state=on]:font-semibold data-[state=on]:text-emerald-800"
        >
          <span className="min-w-0 truncate">{option.label}</span>
          <span className="shrink-0 text-xs text-muted-foreground group-data-[state=on]:text-emerald-700">
            {option.count}
          </span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
