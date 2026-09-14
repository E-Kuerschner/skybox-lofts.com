import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import type { Route } from "./+types/index";
import { isAuthenticated } from "~/util/authHelpers.server";
import { getDatabase } from "~/util/database.server";
import { runAdminAction } from "~/util/crud/adminAction.server";
import { fuzzyMatch } from "~/util/fuzzySearch";
import { cn } from "~/util/ui/utils";
import { AdminOnly } from "~/components/AdminOnly";
import { useStatusBanner } from "~/components/crud/ActionStatusBanner";
import { ConfirmActionDialog } from "~/components/crud/ConfirmActionDialog";
import { NoContent } from "~/components/NoContent";
import { SearchInput } from "~/components/SearchInput";
import {
  MultiSelectFilter,
  type MultiSelectOption,
} from "~/components/MultiSelectFilter";
import { ResponsiveOverlay } from "~/components/ResponsiveOverlay";
import { Button } from "~/components/ui/button";
import {
  createContractor,
  deleteContractor,
  fetchContractorDirectory,
  updateContractor,
} from "./contractors.server";
import { ContractorCard, CONTRACTOR_CARD_MIN_HEIGHT } from "./ContractorCard";
import { ContractorDetail } from "./ContractorDetail";
import { ContractorFormDialog } from "./ContractorFormDialog";
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

/**
 * The services actually offered within one section, for that section's filter.
 *
 * Built from the listings rather than the full catalog so the dropdown never
 * offers a service that would filter the list down to nothing.
 */
function serviceOptions(listings: ContractorListing[]): MultiSelectOption[] {
  const bySlug = new Map<string, MultiSelectOption>();

  for (const listing of listings) {
    for (const service of listing.services) {
      const existing = bySlug.get(service.slug);
      if (existing) existing.count = (existing.count ?? 0) + 1;
      else
        bySlug.set(service.slug, {
          value: service.slug,
          label: service.name,
          count: 1,
        });
    }
  }

  return [...bySlug.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function matchesSearch(contractor: ContractorListing, query: string): boolean {
  if (!query) return true;

  return (
    fuzzyMatch(query, contractor.businessName) ||
    fuzzyMatch(query, contractor.contactName ?? "") ||
    fuzzyMatch(query, contractor.notes ?? "") ||
    contractor.services.some((service) => fuzzyMatch(query, service.name))
  );
}

function matchesFilters(
  listing: ContractorListing,
  query: string,
  selectedSlugs: string[],
): boolean {
  const matchesService =
    selectedSlugs.length === 0 ||
    listing.services.some((service) => selectedSlugs.includes(service.slug));

  return matchesService && matchesSearch(listing, query);
}

function toggleSlug(slug: string) {
  return (current: string[]) =>
    current.includes(slug)
      ? current.filter((value) => value !== slug)
      : [...current, slug];
}

export default function Contractors({ loaderData }: Route.ComponentProps) {
  const { contractors: allContractors, services } = loaderData;
  const { banner, showSuccess } = useStatusBanner();

  // The two flags are independent, so a business that does both kinds of work
  // deliberately appears in both lists rather than having to pick one.
  const { contractors, buildingServices } = useMemo(
    () => ({
      contractors: allContractors.filter(
        (contractor) => contractor.isUnitContractor,
      ),
      buildingServices: allContractors.filter(
        (contractor) => contractor.isBuildingService,
      ),
    }),
    [allContractors],
  );

  // Each section searches only itself, so looking for a painter never quietly
  // reshuffles the building vendors further down the page.
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [buildingSearchQuery, setBuildingSearchQuery] = useState("");
  const [buildingSelectedSlugs, setBuildingSelectedSlugs] = useState<string[]>(
    [],
  );

  const [detailContractor, setDetailContractor] =
    useState<ContractorListing | null>(null);
  const [formContractor, setFormContractor] =
    useState<ContractorListing | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Which section the "add" button that opened the form belongs to, so a new
  // listing starts out as the kind of thing that section holds.
  const [addingBuildingService, setAddingBuildingService] = useState(false);
  const [contractorToDelete, setContractorToDelete] =
    useState<ContractorListing | null>(null);

  const contractorServiceOptions = useMemo(
    () => serviceOptions(contractors),
    [contractors],
  );
  const buildingServiceOptions = useMemo(
    () => serviceOptions(buildingServices),
    [buildingServices],
  );

  const visibleContractors = useMemo(
    () =>
      contractors
        .filter((contractor) =>
          matchesFilters(contractor, searchQuery, selectedSlugs),
        )
        .sort((a, b) => a.businessName.localeCompare(b.businessName)),
    [contractors, searchQuery, selectedSlugs],
  );

  // Listed the way the printed directory is: by the job they're called for.
  const visibleBuildingServices = useMemo(
    () =>
      buildingServices
        .filter((provider) =>
          matchesFilters(provider, buildingSearchQuery, buildingSelectedSlugs),
        )
        .sort(
          (a, b) =>
            (a.services[0]?.name ?? "").localeCompare(
              b.services[0]?.name ?? "",
            ) || a.businessName.localeCompare(b.businessName),
        ),
    [buildingServices, buildingSearchQuery, buildingSelectedSlugs],
  );

  const openAddForm = (asBuildingService = false) => {
    setFormContractor(null);
    setAddingBuildingService(asBuildingService);
    setIsFormOpen(true);
  };

  const openEditForm = (contractor: ContractorListing) => {
    setFormContractor(contractor);
    setAddingBuildingService(contractor.isBuildingService);
    setDetailContractor(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {banner}

      <div className="rounded-xl border-1 bg-white px-4 pb-8 pt-4 shadow-md">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">In-unit work & services</h2>
          <p className="text-muted-foreground lg:max-w-3/4">
            The contractors listed below have been recommended by Skybox Lofts
            residents. Who you decide to contract with is your choice, but for
            your convenience, you may consider any of these contacts as a
            reliable starting place. For any work on your unit/property, please
            reach out to the businesses yourself.
          </p>
          <br />
          <p className="text-muted-foreground">
            If you have worked with a contractor that would be a great addition
            to the list, please let us know!
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search a job or contractor name"
              className="md:max-w-sm"
            />

            <MultiSelectFilter
              label="services"
              options={contractorServiceOptions}
              selectedValues={selectedSlugs}
              onToggle={(slug) => setSelectedSlugs(toggleSlug(slug))}
              onClear={() => setSelectedSlugs([])}
            />
          </div>

          <AdminOnly>
            <Button
              variant="secondary"
              className="shrink-0"
              onClick={() => openAddForm(false)}
            >
              <PlusIcon className="mr-2 size-4" />
              Add contractor
            </Button>
          </AdminOnly>
        </div>

        {contractors.length === 0 ? (
          <EmptyState message="No contractors have been added yet. Check back soon." />
        ) : visibleContractors.length === 0 ? (
          <EmptyState message="No contractors match what you're looking for. Try a different word, or clear the service filter." />
        ) : (
          <ContractorGrid
            contractors={visibleContractors}
            onOpenDetails={setDetailContractor}
            onEdit={openEditForm}
            onDelete={setContractorToDelete}
          />
        )}
      </div>

      {/* Building-wide vendors, kept apart from the list above so someone
          looking for help with their own unit doesn't call the elevator
          company by mistake. */}
      <div className="rounded-xl border-1 bg-white px-4 pb-8 pt-4 shadow-md">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Building service providers</h2>
          <p className="text-muted-foreground lg:max-w-3/4">
            These businesses look after the building itself - the elevator, snow
            removal, the fire alarm system and so on. The board handles these
            contacts, so you shouldn't need to contact them yourself.
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={buildingSearchQuery}
              onChange={setBuildingSearchQuery}
              placeholder="Search a service or provider name"
              className="md:max-w-sm"
            />

            <MultiSelectFilter
              label="services"
              options={buildingServiceOptions}
              selectedValues={buildingSelectedSlugs}
              onToggle={(slug) => setBuildingSelectedSlugs(toggleSlug(slug))}
              onClear={() => setBuildingSelectedSlugs([])}
            />
          </div>

          <AdminOnly>
            <Button
              variant="secondary"
              className="shrink-0"
              onClick={() => openAddForm(true)}
            >
              <PlusIcon className="mr-2 size-4" />
              Add provider
            </Button>
          </AdminOnly>
        </div>

        {buildingServices.length === 0 ? (
          <EmptyState message="No building service providers have been added yet." />
        ) : visibleBuildingServices.length === 0 ? (
          <EmptyState message="No building service providers match what you're looking for." />
        ) : (
          <ContractorGrid
            contractors={visibleBuildingServices}
            showPhotos={false}
            onOpenDetails={setDetailContractor}
            onEdit={openEditForm}
            onDelete={setContractorToDelete}
          />
        )}
      </div>

      {/* Resident-facing detail view */}
      <ResponsiveOverlay
        open={detailContractor !== null}
        onOpenChange={(open) => !open && setDetailContractor(null)}
        title={detailContractor?.businessName ?? ""}
      >
        {detailContractor && <ContractorDetail contractor={detailContractor} />}
      </ResponsiveOverlay>

      {/* Admin-only overlays. The action re-checks the role on every submit. */}
      <ContractorFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        contractor={formContractor}
        defaultBuildingService={addingBuildingService}
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

/** Stands in for the grid, holding a card's height so nothing jumps. */
function EmptyState({ message }: { message: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        CONTRACTOR_CARD_MIN_HEIGHT,
      )}
    >
      <NoContent message={message} className="my-0" />
    </div>
  );
}

function ContractorGrid({
  contractors,
  showPhotos = true,
  onOpenDetails,
  onEdit,
  onDelete,
}: {
  contractors: ContractorListing[];
  showPhotos?: boolean;
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
          showPhoto={showPhotos}
          onOpenDetails={onOpenDetails}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
