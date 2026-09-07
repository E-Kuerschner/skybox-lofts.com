import { XIcon } from "lucide-react";
import { cn } from "~/util/ui/utils";
import type { ContractorService } from "./types";

export type ServiceWithCount = ContractorService & { contractorCount: number };

/**
 * The main way residents narrow the list: pick the job you need done.
 *
 * Services with no contractors behind them are left out — an empty chip is a
 * dead end, and the point of this row is that every tap leads somewhere.
 */
export function ServiceFilterChips({
  services,
  selectedSlugs,
  onToggle,
  onClear,
}: {
  services: ServiceWithCount[];
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
  onClear: () => void;
}) {
  if (services.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {services.map((service) => {
        const isSelected = selectedSlugs.includes(service.slug);

        return (
          <button
            key={service.slug}
            type="button"
            onClick={() => onToggle(service.slug)}
            aria-pressed={isSelected}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors active:scale-95",
              isSelected
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-border bg-white text-foreground hover:border-emerald-600 hover:text-emerald-700",
            )}
          >
            {service.name}
            <span
              className={cn(
                "ml-1.5 text-xs",
                isSelected ? "text-emerald-50" : "text-muted-foreground",
              )}
            >
              {service.contractorCount}
            </span>
          </button>
        );
      })}

      {selectedSlugs.length > 0 && (
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

/** Small read-only pills used on contractor cards and detail views. */
export function ServiceBadges({
  services,
  highlightSlugs = [],
  className,
}: {
  services: ContractorService[];
  highlightSlugs?: string[];
  className?: string;
}) {
  if (services.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {services.map((service) => (
        <li
          key={service.slug}
          className={cn(
            "rounded-full border px-2 py-0.5 text-xs",
            highlightSlugs.includes(service.slug)
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          {service.name}
        </li>
      ))}
    </ul>
  );
}
