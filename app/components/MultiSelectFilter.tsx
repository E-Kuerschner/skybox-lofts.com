import { CheckIcon, ChevronDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/util/ui/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
  /** How many items carry this option, shown next to the label. */
  count?: number;
};

/**
 * Narrows a list down to the options someone picks, from a dropdown.
 *
 * Nothing selected means no filtering at all - the trigger says so, rather than
 * making "none selected" look like "nothing matches".
 */
export function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onToggle,
  onClear,
  className,
}: {
  /** Plural noun for what's being filtered, e.g. "services". */
  label: string;
  options: readonly MultiSelectOption[];
  selectedValues: readonly string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  className?: string;
}) {
  if (options.length === 0) return null;

  const selectedCount = selectedValues.length;
  const summary =
    selectedCount === 0
      ? `All ${label}`
      : selectedCount === 1
        ? (options.find((option) => option.value === selectedValues[0])
            ?.label ?? `1 ${label}`)
        : `${selectedCount} ${label}`;

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border bg-white px-4 text-sm shadow-sm transition-colors hover:bg-stone-50",
          selectedCount > 0 && "border-ring bg-emerald-50 hover:bg-emerald-50",
          className,
        )}
      >
        <span className="max-w-40 truncate">{summary}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0" align="start">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Filter by {label}</span>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="cursor-pointer text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto p-1">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onToggle(option.value)}
                aria-pressed={isSelected}
                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-sm border",
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-input",
                  )}
                >
                  {isSelected && <CheckIcon className="size-3" />}
                </span>
                <span className="grow truncate">{option.label}</span>
                {option.count !== undefined && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {option.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
