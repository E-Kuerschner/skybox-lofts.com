import { fuzzyMatch } from "~/util/fuzzySearch";
import type { ContractorListing, ContractorService } from "./types";

/** Which list the page is showing. */
export type DirectoryTab = "unit" | "building";

/** The job picker's "show everything" choice, alongside the service slugs. */
export const ALL_JOBS = "all";

export type JobOption = {
  value: string;
  label: string;
  count: number;
};

/** One job heading and the contractors filed under it. */
export type JobGroup = {
  service: ContractorService;
  contractors: ContractorListing[];
};

/**
 * The jobs residents can pick from, each with how many contractors do it.
 *
 * Built from the listings rather than the full catalog so the picker never
 * offers a job that leads to an empty list.
 */
export function jobOptions(listings: ContractorListing[]): JobOption[] {
  const bySlug = new Map<string, JobOption>();

  for (const listing of listings) {
    for (const service of listing.services) {
      const existing = bySlug.get(service.slug);
      if (existing) existing.count += 1;
      else
        bySlug.set(service.slug, {
          value: service.slug,
          label: service.name,
          count: 1,
        });
    }
  }

  const jobs = [...bySlug.values()].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  return [{ value: ALL_JOBS, label: "All jobs", count: listings.length }, ...jobs];
}

export function matchesSearch(
  contractor: ContractorListing,
  query: string,
): boolean {
  if (!query) return true;

  return (
    fuzzyMatch(query, contractor.businessName) ||
    fuzzyMatch(query, contractor.notes ?? "") ||
    contractor.services.some((service) => fuzzyMatch(query, service.name))
  );
}

/**
 * Contractors grouped under each job they do, the way someone looking for a
 * painter thinks about the list.
 *
 * A business that does several jobs shows up under each of them, so it's
 * found whichever job a resident starts from. Groups left empty by the search
 * are dropped rather than shown as bare headings.
 */
export function groupByJob(
  listings: ContractorListing[],
  pickedJob: string,
  query: string,
): JobGroup[] {
  const groups = new Map<string, JobGroup>();

  for (const listing of listings) {
    if (!matchesSearch(listing, query)) continue;

    for (const service of listing.services) {
      if (pickedJob !== ALL_JOBS && service.slug !== pickedJob) continue;

      const group = groups.get(service.slug);
      if (group) group.contractors.push(listing);
      else groups.set(service.slug, { service, contractors: [listing] });
    }
  }

  return [...groups.values()]
    .sort((a, b) => a.service.name.localeCompare(b.service.name))
    .map((group) => ({
      ...group,
      contractors: group.contractors.sort((a, b) =>
        a.businessName.localeCompare(b.businessName),
      ),
    }));
}

/** The jobs a contractor does besides the one they're listed under. */
export function otherJobs(
  contractor: ContractorListing,
  underSlug: string,
): string | null {
  const others = contractor.services
    .filter((service) => service.slug !== underSlug)
    .map((service) => service.name);

  return others.length > 0 ? `Also: ${others.join(", ")}` : null;
}

export function searchPlaceholder(jobs: JobOption[], pickedJob: string) {
  const picked = jobs.find((job) => job.value === pickedJob);

  return pickedJob === ALL_JOBS || !picked
    ? "Search a business, job or note"
    : `Search within ${picked.label}`;
}

/**
 * One tab's worth of directory: its jobs, what's picked and searched, and the
 * contractors grouped to match. Both tabs are browsed the same way.
 */
export type DirectorySection = {
  /** How many businesses the tab holds before any filtering. */
  total: number;
  jobs: JobOption[];
  pickedJob: string;
  onPickJob: (job: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  groups: JobGroup[];
};

/** What a card or row needs to act on a listing. */
export type ListingHandlers = {
  onOpenDetails: (contractor: ContractorListing) => void;
  onEdit: (contractor: ContractorListing) => void;
  onDelete: (contractor: ContractorListing) => void;
};

/** Everything the desktop and phone layouts of the page share. */
export type DirectoryViewProps = ListingHandlers & {
  tab: DirectoryTab;
  onTabChange: (tab: DirectoryTab) => void;
  unit: DirectorySection;
  building: DirectorySection;
  onAdd: (asBuildingService: boolean) => void;
};
