import { PlusIcon } from "lucide-react";
import { AdminOnly } from "~/components/AdminOnly";
import { CategoryPicker } from "~/components/CategoryPicker";
import { NoContent } from "~/components/NoContent";
import { SearchInput } from "~/components/SearchInput";
import { Button } from "~/components/ui/button";
import { ContractorJobCard } from "./ContractorJobCard";
import {
  ALL_JOBS,
  searchPlaceholder,
  type DirectorySection,
  type ListingHandlers,
} from "./directory";

export type DirectoryBrowserCopy = {
  title: string;
  description: string;
  addLabel: string;
  /** Shown when the tab has no listings at all yet. */
  emptyMessage: string;
};

/**
 * One tab of the directory on wider screens: the job list sits beside the
 * listings and stays in view while they scroll. Both tabs use it, so they're
 * browsed exactly the same way.
 */
export function DirectoryBrowserDesktop({
  section,
  copy,
  showPhotos,
  onAdd,
  ...handlers
}: ListingHandlers & {
  section: DirectorySection;
  copy: DirectoryBrowserCopy;
  showPhotos: boolean;
  onAdd: () => void;
}) {
  const { total, jobs, pickedJob, onPickJob, query, onQueryChange, groups } =
    section;

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-semibold">{copy.title}</h2>
        <p className="max-w-3xl text-muted-foreground">{copy.description}</p>
      </div>

      <div className="flex items-start gap-6">
        <aside className="sticky top-4 flex w-56 shrink-0 flex-col gap-3">
          <AdminOnly>
            <Button variant="secondary" onClick={onAdd}>
              <PlusIcon />
              {copy.addLabel}
            </Button>
          </AdminOnly>
          <CategoryPicker
            layout="list"
            ariaLabel="Jobs"
            options={jobs}
            value={pickedJob}
            allValue={ALL_JOBS}
            onValueChange={onPickJob}
          />
        </aside>

        <div className="flex min-w-0 grow flex-col gap-6">
          <SearchInput
            value={query}
            onChange={onQueryChange}
            placeholder={searchPlaceholder(jobs, pickedJob)}
          />

          {total === 0 ? (
            <NoContent message={copy.emptyMessage} />
          ) : groups.length === 0 ? (
            <NoContent message="Nothing matches that. Try a different word, or pick “All jobs”." />
          ) : (
            groups.map(({ service, contractors }) => (
              <section key={service.slug} className="flex flex-col gap-2.5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {service.name}
                </h3>
                <div className="grid items-start gap-3 xl:grid-cols-2">
                  {contractors.map((contractor) => (
                    <ContractorJobCard
                      key={contractor.id}
                      contractor={contractor}
                      underSlug={service.slug}
                      showPhoto={showPhotos}
                      {...handlers}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </>
  );
}
