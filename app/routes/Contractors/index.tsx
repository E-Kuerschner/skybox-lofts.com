import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import type { Route } from "./+types/index";
import { isAuthenticated } from "~/util/authHelpers.server";
import { getDatabase } from "~/util/database.server";
import { getGoogleMapsApiKey } from "~/util/googleMaps.server";
import { runAdminAction } from "~/util/crud/adminAction.server";
import { fuzzyMatch } from "~/util/fuzzySearch";
import { cn } from "~/util/ui/utils";
import { AdminOnly } from "~/components/AdminOnly";
import { useStatusBanner } from "~/components/crud/ActionStatusBanner";
import { ConfirmActionDialog } from "~/components/crud/ConfirmActionDialog";
import { NoContent } from "~/components/NoContent";
import { SearchInput } from "~/components/SearchInput";
import { ResponsiveOverlay } from "~/components/ResponsiveOverlay";
import { Button } from "~/components/ui/button";
import {
  createContractor,
  deleteContractor,
  fetchContractorDirectory,
  updateContractor,
} from "./contractors.server";
import { ContractorCard } from "./ContractorCard";
import { ContractorDetail } from "./ContractorDetail";
import { ContractorFormDialog } from "./ContractorFormDialog";
import { ContractorMap } from "./ContractorMap";
import {
  ServiceFilterChips,
  type ServiceWithCount,
} from "./ServiceFilterChips";
import type { ContractorListing } from "./types";

export async function loader({ request, context }: Route.LoaderArgs) {
  await isAuthenticated(request, context);

  const { contractors, services } = await fetchContractorDirectory(
    getDatabase(context),
  );

  // `isAdmin` deliberately isn't returned here - the resident layout already
  // provides it, and `useIsAdmin()` reads it from there.
  return {
    contractors,
    services,
    googleMapsApiKey: getGoogleMapsApiKey(context),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  return runAdminAction(
    { request, context },
    {
      create: createContractor,
      update: updateContractor,
      delete: deleteContractor,
    },
  );
}

type SortMode = "service" | "name";

function matchesSearch(contractor: ContractorListing, query: string): boolean {
  if (!query) return true;

  return (
    fuzzyMatch(query, contractor.businessName) ||
    fuzzyMatch(query, contractor.contactName ?? "") ||
    fuzzyMatch(query, contractor.notes ?? "") ||
    contractor.services.some((service) => fuzzyMatch(query, service.name))
  );
}

export default function Contractors({ loaderData }: Route.ComponentProps) {
  const { contractors, services, googleMapsApiKey } = loaderData;
  const { banner, showSuccess } = useStatusBanner();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("service");

  const [detailContractor, setDetailContractor] =
    useState<ContractorListing | null>(null);
  const [formContractor, setFormContractor] =
    useState<ContractorListing | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contractorToDelete, setContractorToDelete] =
    useState<ContractorListing | null>(null);

  const servicesWithCounts: ServiceWithCount[] = useMemo(() => {
    return services
      .map((service) => ({
        ...service,
        contractorCount: contractors.filter((contractor) =>
          contractor.services.some((offered) => offered.id === service.id),
        ).length,
      }))
      .filter((service) => service.contractorCount > 0);
  }, [services, contractors]);

  const visibleContractors = useMemo(() => {
    return contractors.filter((contractor) => {
      const matchesService =
        selectedSlugs.length === 0 ||
        contractor.services.some((service) =>
          selectedSlugs.includes(service.slug),
        );

      return matchesService && matchesSearch(contractor, searchQuery);
    });
  }, [contractors, selectedSlugs, searchQuery]);

  /**
   * In "by service" mode the same contractor shows up under every service it
   * offers. That repetition is the point: someone looking for balcony painting
   * should find every painter under "Balcony Painting" without having to read
   * each listing to check.
   */
  const serviceSections = useMemo(() => {
    const sections = servicesWithCounts
      .filter(
        (service) =>
          selectedSlugs.length === 0 || selectedSlugs.includes(service.slug),
      )
      .map((service) => ({
        service,
        contractors: visibleContractors.filter((contractor) =>
          contractor.services.some((offered) => offered.id === service.id),
        ),
      }))
      .filter((section) => section.contractors.length > 0);

    return sections;
  }, [servicesWithCounts, selectedSlugs, visibleContractors]);

  const contractorsByName = useMemo(
    () =>
      [...visibleContractors].sort((a, b) =>
        a.businessName.localeCompare(b.businessName),
      ),
    [visibleContractors],
  );

  const toggleService = (slug: string) => {
    setSelectedSlugs((current) =>
      current.includes(slug)
        ? current.filter((value) => value !== slug)
        : [...current, slug],
    );
  };

  const openAddForm = () => {
    setFormContractor(null);
    setIsFormOpen(true);
  };

  const openEditForm = (contractor: ContractorListing) => {
    setFormContractor(contractor);
    setDetailContractor(null);
    setIsFormOpen(true);
  };

  const hasAnyContractors = contractors.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {banner}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-xl border-1 bg-white px-4 pb-8 pt-4 shadow-md">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row">
            <p className="text-muted-foreground">
              These are contractors other residents and the board have used and
              recommend. Start with the kind of work you need done, then get in
              touch with them directly — the building doesn't arrange or pay for
              the work.
            </p>
            <AdminOnly>
              <Button variant="cta" className="shrink-0" onClick={openAddForm}>
                <PlusIcon className="mr-2 size-4" />
                Add contractor
              </Button>
            </AdminOnly>
          </div>

          {hasAnyContractors ? (
            <>
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search a job or a business name..."
                  className="md:max-w-sm"
                />

                <div
                  className="flex shrink-0 rounded-full border bg-white p-0.5 text-sm"
                  role="group"
                  aria-label="How to sort the list"
                >
                  {(
                    [
                      ["service", "By service"],
                      ["name", "By name"],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSortMode(mode)}
                      aria-pressed={sortMode === mode}
                      className={cn(
                        "cursor-pointer rounded-full px-3 py-1.5 transition-colors",
                        sortMode === mode
                          ? "bg-emerald-600 text-white"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <ServiceFilterChips
                  services={servicesWithCounts}
                  selectedSlugs={selectedSlugs}
                  onToggle={toggleService}
                  onClear={() => setSelectedSlugs([])}
                />
              </div>

              {visibleContractors.length === 0 ? (
                <NoContent message="No contractors match what you're looking for. Try a different word, or clear the filters above." />
              ) : sortMode === "service" ? (
                <div className="space-y-8">
                  {serviceSections.map(({ service, contractors: matches }) => (
                    <section key={service.slug}>
                      <h2 className="mb-3 border-b pb-1.5 text-lg font-semibold">
                        {service.name}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          {matches.length}{" "}
                          {matches.length === 1 ? "business" : "businesses"}
                        </span>
                      </h2>
                      <ContractorGrid
                        contractors={matches}
                        highlightSlugs={[service.slug]}
                        onOpenDetails={setDetailContractor}
                        onEdit={openEditForm}
                        onDelete={setContractorToDelete}
                      />
                    </section>
                  ))}
                </div>
              ) : (
                <ContractorGrid
                  contractors={contractorsByName}
                  highlightSlugs={selectedSlugs}
                  onOpenDetails={setDetailContractor}
                  onEdit={openEditForm}
                  onDelete={setContractorToDelete}
                />
              )}
            </>
          ) : (
            <NoContent message="No contractors have been added yet. Check back soon." />
          )}
        </div>

        <ContractorMap
          contractors={contractors}
          apiKey={googleMapsApiKey}
          className="lg:sticky lg:top-6"
        />
      </div>

      {/* Resident-facing detail view */}
      <ResponsiveOverlay
        open={detailContractor !== null}
        onOpenChange={(open) => !open && setDetailContractor(null)}
        title={detailContractor?.businessName ?? ""}
      >
        {detailContractor && (
          <ContractorDetail
            contractor={detailContractor}
            googleMapsApiKey={googleMapsApiKey}
          />
        )}
      </ResponsiveOverlay>

      {/* Admin-only overlays. The action re-checks the role on every submit. */}
      <ContractorFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        contractor={formContractor}
        services={services}
        onSuccess={showSuccess}
      />

      {contractorToDelete && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && setContractorToDelete(null)}
          title="Remove this contractor?"
          intent="delete"
          recordId={contractorToDelete.id}
          confirmLabel="Remove contractor"
          pendingLabel="Removing..."
          cancelLabel="Keep it"
          destructive
          onSuccess={showSuccess}
        >
          <span className="font-medium text-foreground">
            {contractorToDelete.businessName}
          </span>{" "}
          will no longer show up for residents, and any photos on the listing
          will be deleted. This can't be undone.
        </ConfirmActionDialog>
      )}

    </div>
  );
}

function ContractorGrid({
  contractors,
  highlightSlugs,
  onOpenDetails,
  onEdit,
  onDelete,
}: {
  contractors: ContractorListing[];
  highlightSlugs: string[];
  onOpenDetails: (contractor: ContractorListing) => void;
  onEdit: (contractor: ContractorListing) => void;
  onDelete: (contractor: ContractorListing) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {contractors.map((contractor) => (
        <ContractorCard
          key={contractor.id}
          contractor={contractor}
          highlightSlugs={highlightSlugs}
          onOpenDetails={onOpenDetails}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
