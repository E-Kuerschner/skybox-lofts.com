import { XIcon } from "lucide-react";
import { cn } from "~/util/ui/utils";

export type FilterChipOption<T extends string> = {
  value: T;
  label: string;
  /** Shown as a small counter next to the label, e.g. how many results it matches. */
  count?: number;
};

/**
 * A row of multi-select toggle chips, e.g. narrowing a list down by category.
 * Selected chips use the same border/fill/text treatment as `SegmentedToggle`
 * so "currently active" reads consistently across the app.
 */
export function FilterChipGroup<T extends string>({
  options,
  selectedValues,
  onToggle,
  onClear,
  className,
}: {
  options: readonly FilterChipOption<T>[];
  selectedValues: T[];
  onToggle: (value: T) => void;
  onClear?: () => void;
  className?: string;
}) {
  if (options.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            aria-pressed={isSelected}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors active:scale-95",
              isSelected
                ? "border-ring bg-emerald-50 text-emerald-800"
                : "border-border bg-white text-foreground hover:border-emerald-600 hover:text-emerald-700",
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  "ml-1.5 text-xs",
                  isSelected ? "text-emerald-700" : "text-muted-foreground",
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}

      {onClear && selectedValues.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <XIcon className="size-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
