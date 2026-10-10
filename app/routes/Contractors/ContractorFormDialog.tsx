import { useEffect, useState } from "react";
import { ChevronLeftIcon } from "lucide-react";
import { CheckboxGroup } from "~/components/CheckboxGroup";
import { FormSection, RequiredMark } from "~/components/FormSection";
import { CrudFormDialog } from "~/components/crud/CrudFormDialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { PhotoField } from "./PhotoField";
import { ServicePicker } from "./ServicePicker";
import type { ContractorListing, ContractorService } from "./types";

const MAX_PHOTOS = 6;

const inputClass = "h-10 bg-card";

/**
 * Adding or editing a listing. Its sections follow the same order as the
 * details view - photos, name, services, how to reach them, good to know - so
 * jumping from one to the other feels like the same card turning editable.
 */
export function ContractorFormDialog({
  open,
  onOpenChange,
  contractor,
  defaultBuildingService = false,
  canChooseSections,
  services,
  onSuccess,
  onBack,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The listing being edited, or null when adding a new one. */
  contractor: ContractorListing | null;
  /** How a brand new listing starts out, set by which "add" button was used. */
  defaultBuildingService?: boolean;
  /**
   * Only admins choose which list(s) a business goes in. Owners don't see the
   * choice: what they add goes in the in-unit list, and what they edit stays
   * where it is.
   */
  canChooseSections: boolean;
  services: ContractorService[];
  onSuccess: (message: string) => void;
  /** Set when the form was opened from the details view, to go back to it. */
  onBack?: () => void;
}) {
  const isEditing = contractor !== null;

  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [isUnitContractor, setIsUnitContractor] = useState(true);
  const [isBuildingService, setIsBuildingService] = useState(false);

  // The dialog resets uncontrolled fields on its own; these are the few bits of
  // this form that React holds rather than the DOM.
  useEffect(() => {
    if (!open) return;
    setSelectedServiceIds(contractor?.services.map((s) => s.id) ?? []);
    // A new listing starts out as whatever the tab its "add" button lives on
    // holds; an existing one keeps the lists it's already in.
    setIsUnitContractor(
      contractor?.isUnitContractor ?? !defaultBuildingService,
    );
    setIsBuildingService(
      contractor?.isBuildingService ?? defaultBuildingService,
    );
  }, [open, contractor, defaultBuildingService]);

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode={isEditing ? "edit" : "create"}
      entityName="contractor"
      recordId={contractor?.id}
      hasFileUploads
      onSuccess={onSuccess}
      contentClassName="md:max-w-[37.5rem]"
      description={
        isEditing
          ? "Changes show up for residents right away."
          : "Residents find contractors by the services you pick."
      }
      submitDisabled={
        selectedServiceIds.length === 0 ||
        (canChooseSections && !isUnitContractor && !isBuildingService)
      }
      headerStart={
        isEditing &&
        onBack && (
          <button
            type="button"
            onClick={onBack}
            className="-ml-1 flex h-8 w-fit cursor-pointer items-center gap-0.5 rounded-md pr-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            <ChevronLeftIcon className="size-4" />
            Back to {contractor.businessName}
          </button>
        )
      }
    >
      <FormSection title="Photos (optional)">
        <PhotoField
          existingPhotos={contractor?.photos ?? []}
          maxPhotos={MAX_PHOTOS}
        />
      </FormSection>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="businessName">
          Business name
          <RequiredMark />
        </Label>
        <Input
          id="businessName"
          name="businessName"
          className={inputClass}
          required
          defaultValue={contractor?.businessName ?? ""}
          placeholder="Northside Heating & Cooling"
        />
      </div>

      <FormSection title="Services" required>
        <ServicePicker
          services={services}
          selectedIds={selectedServiceIds}
          onChange={setSelectedServiceIds}
        />
      </FormSection>

      <FormSection
        title="How to reach them"
        required
        hint="Add a phone number or an email so residents can get in touch. One is enough, but both is better. Website and address are optional."
      >
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                className={inputClass}
                defaultValue={contractor?.phone ?? ""}
                placeholder="(312) 555-0143"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                className={inputClass}
                defaultValue={contractor?.email ?? ""}
                placeholder="hello@example.com"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              className={inputClass}
              defaultValue={contractor?.website ?? ""}
              placeholder="https://example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              className={inputClass}
              defaultValue={contractor?.address ?? ""}
              placeholder="1234 W Addison St, Chicago, IL 60613"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Good to know">
        <Textarea
          aria-label="Good to know"
          name="notes"
          rows={3}
          className="bg-muted/40"
          defaultValue={contractor?.notes ?? ""}
          placeholder="Who to ask for, and anything else residents should know. For example: Ask for Dana. Has worked in the building before."
        />
      </FormSection>

      {canChooseSections && (
        <CheckboxGroup
          legend="Show this business under"
          options={[
            {
              name: "isUnitContractor",
              label: "In-unit work",
              description: "Work owners arrange for their own unit.",
              checked: isUnitContractor,
              onChange: setIsUnitContractor,
            },
            {
              name: "isBuildingService",
              label: "Building services",
              description: "Work on the building. The board handles these.",
              checked: isBuildingService,
              onChange: setIsBuildingService,
            },
          ]}
        />
      )}
    </CrudFormDialog>
  );
}
