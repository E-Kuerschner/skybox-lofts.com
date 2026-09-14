import { FilterChipGroup } from "~/components/FilterChipGroup";
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
  return (
    <FilterChipGroup
      options={services.map((service) => ({
        value: service.slug,
        label: service.name,
        count: service.contractorCount,
      }))}
      selectedValues={selectedSlugs}
      onToggle={onToggle}
      onClear={onClear}
    />
  );
}

/**
 * Small read-only pills used on contractor cards and detail views.
 *
 * They carry the app's green accent because there is no longer a second,
 * "matched" state to tell them apart from - every badge simply names a service
 * the business offers.
 */
export function ServiceBadges({
  services,
  className,
}: {
  services: ContractorService[];
  className?: string;
}) {
  if (services.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {services.map((service) => (
        <li
          key={service.slug}
          className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800"
        >
          {service.name}
        </li>
      ))}
    </ul>
  );
}
