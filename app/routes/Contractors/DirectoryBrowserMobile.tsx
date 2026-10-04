import { CategoryPicker } from "~/components/CategoryPicker";
import { NoContent } from "~/components/NoContent";
import { SearchInput } from "~/components/SearchInput";
import { ContractorJobRow } from "./ContractorJobRow";
import {
  ALL_JOBS,
  searchPlaceholder,
  type DirectorySection,
  type ListingHandlers,
} from "./directory";

/**
 * One tab of the directory on phones: a single column, with the job list
 * turned into a row of chips that scrolls sideways. Both tabs use it.
 */
export function DirectoryBrowserMobile({
  section,
  intro,
  emptyMessage,
  ...handlers
}: ListingHandlers & {
  section: DirectorySection;
  /** Optional line of context above the controls. */
  intro?: string;
  emptyMessage: string;
}) {
  const { total, jobs, pickedJob, onPickJob, query, onQueryChange, groups } =
    section;

  return (
    <>
      {intro && <p className="text-sm text-muted-foreground">{intro}</p>}

      <CategoryPicker
        layout="chips"
        ariaLabel="Jobs"
        options={jobs}
        value={pickedJob}
        allValue={ALL_JOBS}
        onValueChange={onPickJob}
        className="-mx-3 px-3 pb-1 md:-mx-8 md:px-8"
      />

      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder={
          pickedJob === ALL_JOBS
            ? "What do you need done?"
            : searchPlaceholder(jobs, pickedJob)
        }
      />

      {total === 0 ? (
        <NoContent message={emptyMessage} />
      ) : groups.length === 0 ? (
        <NoContent message="Nothing matches that. Try a different word, or pick “All jobs”." />
      ) : (
        groups.map(({ service, contractors }) => (
          <section key={service.slug} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {service.name}
            </h3>
            <ul className="overflow-hidden rounded-xl border bg-card">
              {contractors.map((contractor) => (
                <ContractorJobRow
                  key={contractor.id}
                  contractor={contractor}
                  underSlug={service.slug}
                  {...handlers}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
