import { useMemo, useState } from "react";
import type { Route } from "./+types/index";
import { isAuthenticated } from "~/util/authHelpers.server";
import { getDatabase } from "~/util/database.server";
import { runAdminAction } from "~/util/crud/adminAction.server";
import { useStatusBanner } from "~/components/crud/ActionStatusBanner";
import { ConfirmActionDialog } from "~/components/crud/ConfirmActionDialog";
import { ResponsiveOverlay } from "~/components/ResponsiveOverlay";
import {
  createContractor,
  deleteContractor,
  fetchContractorDirectory,
  updateContractor,
} from "./contractors.server";
import { ContractorDetail } from "./ContractorDetail";
import { ContractorFormDialog } from "./ContractorFormDialog";
import { ContractorsDesktop } from "./ContractorsDesktop";
import { ContractorsMobile } from "./ContractorsMobile";
import type { DirectoryTab, DirectoryViewProps } from "./directory";
import { useDirectorySection } from "./useDirectorySection";
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

export default function Contractors({ loaderData }: Route.ComponentProps) {
  const { contractors: allContractors, services } = loaderData;
  const { banner, showSuccess } = useStatusBanner();

  // The two flags are independent, so a business that does both kinds of work
  // deliberately appears in both lists rather than having to pick one.
  const { contractors, buildingProviders } = useMemo(
    () => ({
      contractors: allContractors.filter(
        (contractor) => contractor.isUnitContractor,
      ),
      buildingProviders: allContractors.filter(
        (contractor) => contractor.isBuildingService,
      ),
    }),
    [allContractors],
  );

  // Held here rather than in each layout so switching between the phone and
  // desktop layouts (rotating a tablet, say) keeps what the person picked.
  const [tab, setTab] = useState<DirectoryTab>("unit");
  const unit = useDirectorySection(contractors);
  const building = useDirectorySection(buildingProviders);

  const [detailContractor, setDetailContractor] =
    useState<ContractorListing | null>(null);
  const [formContractor, setFormContractor] =
    useState<ContractorListing | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Whether the edit form was opened from the details view, so it can offer a
  // way back there.
  const [editingFromDetails, setEditingFromDetails] = useState(false);
  // Which list the "add" button that opened the form belongs to, so a new
  // listing starts out as the kind of thing that list holds.
  const [addingBuildingService, setAddingBuildingService] = useState(false);
  const [contractorToDelete, setContractorToDelete] =
    useState<ContractorListing | null>(null);

  const openAddForm = (asBuildingService: boolean) => {
    setFormContractor(null);
    setEditingFromDetails(false);
    setAddingBuildingService(asBuildingService);
    setIsFormOpen(true);
  };

  const openEditForm = (contractor: ContractorListing, fromDetails = false) => {
    setFormContractor(contractor);
    setEditingFromDetails(fromDetails);
    setAddingBuildingService(contractor.isBuildingService);
    setDetailContractor(null);
    setIsFormOpen(true);
  };

  const viewProps: DirectoryViewProps = {
    tab,
    onTabChange: setTab,
    unit,
    building,
    onAdd: openAddForm,
    onOpenDetails: setDetailContractor,
    onEdit: (contractor) => openEditForm(contractor),
    onDelete: setContractorToDelete,
  };

  return (
    <div className="flex flex-col gap-6">
      {banner}

      <ContractorsMobile {...viewProps} className="lg:hidden" />
      <ContractorsDesktop {...viewProps} className="hidden lg:flex" />

      {/* Resident-facing detail view */}
      <ResponsiveOverlay
        open={detailContractor !== null}
        onOpenChange={(open) => !open && setDetailContractor(null)}
        title={detailContractor?.businessName ?? ""}
        contentClassName="md:max-w-[35rem]"
        hideHeader
        bare
      >
        {detailContractor && (
          <ContractorDetail
            contractor={detailContractor}
            onEdit={(contractor) => openEditForm(contractor, true)}
            onRemove={(contractor) => {
              setDetailContractor(null);
              setContractorToDelete(contractor);
            }}
          />
        )}
      </ResponsiveOverlay>

      {/* Admin-only overlays. The action re-checks the role on every submit. */}
      <ContractorFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        contractor={formContractor}
        defaultBuildingService={addingBuildingService}
        services={services}
        onSuccess={showSuccess}
        onBack={
          editingFromDetails && formContractor
            ? () => {
                setIsFormOpen(false);
                setDetailContractor(formContractor);
              }
            : undefined
        }
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
