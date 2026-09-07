import { useEffect, useMemo, useState } from "react";
import type { FetcherWithComponents } from "react-router";
import { Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ResponsiveOverlay } from "~/components/ResponsiveOverlay";
import { ActionStatusBanner } from "~/components/ActionStatusBanner";
import { contractorPhotoUrl } from "~/util/contractorPhotoUrl";
import { cn } from "~/util/ui/utils";
import type {
  ContractorListing,
  ContractorService,
} from "./types";

const MAX_PHOTOS = 6;

export function ContractorFormDialog({
  open,
  onOpenChange,
  contractor,
  services,
  fetcher,
  result,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The listing being edited, or null when adding a new one. */
  contractor: ContractorListing | null;
  services: ContractorService[];
  fetcher: FetcherWithComponents<unknown>;
  /** Outcome of the most recent save attempt made from this dialog. */
  result: unknown;
}) {
  const isEditing = contractor !== null;
  const isSubmitting = fetcher.state !== "idle";

  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [newServices, setNewServices] = useState("");
  const [photoIdsToRemove, setPhotoIdsToRemove] = useState<number[]>([]);
  const [newPhotoCount, setNewPhotoCount] = useState(0);

  // Reset the parts of the form we track in React whenever the dialog opens for
  // a different listing. Everything else is left to the browser via defaultValue.
  useEffect(() => {
    if (!open) return;
    setSelectedServiceIds(contractor?.services.map((s) => s.id) ?? []);
    setNewServices("");
    setPhotoIdsToRemove([]);
    setNewPhotoCount(0);
  }, [open, contractor]);

  const remainingPhotoSlots = useMemo(() => {
    const kept =
      (contractor?.photos.length ?? 0) - photoIdsToRemove.length;
    return Math.max(0, MAX_PHOTOS - kept);
  }, [contractor, photoIdsToRemove]);

  const toggleService = (serviceId: number) => {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  };

  const togglePhotoRemoval = (photoId: number) => {
    setPhotoIdsToRemove((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId],
    );
  };

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) onOpenChange(next);
      }}
      title={isEditing ? "Edit contractor" : "Add a contractor"}
      description={
        isEditing
          ? "Update this contractor's details. Residents will see your changes right away."
          : "Add a contractor the building has vetted. Residents will be able to find them by the services they offer."
      }
    >
      <fetcher.Form
        method="post"
        encType="multipart/form-data"
        className="space-y-4 overflow-y-auto pt-2 max-h-[70vh]"
      >
        <input type="hidden" name="intent" value={isEditing ? "update" : "create"} />
        {isEditing && (
          <input type="hidden" name="contractorId" value={contractor.id} />
        )}

        <ActionStatusBanner result={result} />

        <div className="space-y-2">
          <Label htmlFor="businessName">
            Business or owner name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            name="businessName"
            className="bg-white"
            required
            defaultValue={contractor?.businessName ?? ""}
            placeholder="Northside Heating & Cooling"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">Person to ask for</Label>
          <Input
            id="contactName"
            name="contactName"
            className="bg-white"
            defaultValue={contractor?.contactName ?? ""}
            placeholder="Dana Ruiz"
            disabled={isSubmitting}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            How residents reach them{" "}
            <span className="text-muted-foreground">
              (a phone number or an email, at least one)
            </span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              aria-label="Phone number"
              name="phone"
              type="tel"
              className="bg-white"
              defaultValue={contractor?.phone ?? ""}
              placeholder="(312) 555-0143"
              disabled={isSubmitting}
            />
            <Input
              aria-label="Email address"
              name="email"
              type="email"
              className="bg-white"
              defaultValue={contractor?.email ?? ""}
              placeholder="hello@example.com"
              disabled={isSubmitting}
            />
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            className="bg-white"
            defaultValue={contractor?.address ?? ""}
            placeholder="1234 W Addison St, Chicago, IL 60613"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Optional. When it's filled in, residents get a link straight to
            Google Maps.
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            Services offered <span className="text-destructive">*</span>
          </legend>
          <div className="grid max-h-48 gap-1.5 overflow-y-auto rounded-lg border bg-white p-3 sm:grid-cols-2">
            {services.map((service) => (
              <label
                key={service.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm",
                  selectedServiceIds.includes(service.id) && "bg-emerald-50",
                )}
              >
                <input
                  type="checkbox"
                  name="serviceIds"
                  value={service.id}
                  checked={selectedServiceIds.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                  disabled={isSubmitting}
                  className="size-4 accent-emerald-600"
                />
                {service.name}
              </label>
            ))}
          </div>
          <Label htmlFor="newServices" className="pt-1">
            Something not on the list?
          </Label>
          <Input
            id="newServices"
            name="newServices"
            className="bg-white"
            value={newServices}
            onChange={(event) => setNewServices(event.target.value)}
            placeholder="Awning Repair, Tuckpointing"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Separate several with commas. New services are added to the list for
            everyone.
          </p>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="notes">Good to know</Label>
          <Textarea
            id="notes"
            name="notes"
            className="bg-white"
            rows={3}
            defaultValue={contractor?.notes ?? ""}
            placeholder="Has worked in the building before. Mention you're a Skybox Lofts resident."
            disabled={isSubmitting}
          />
        </div>

        {isEditing && contractor.photos.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Current photos</p>
            <div className="flex flex-wrap gap-2">
              {contractor.photos.map((photo) => {
                const markedForRemoval = photoIdsToRemove.includes(photo.id);

                return (
                  <div key={photo.id} className="relative">
                    <img
                      src={contractorPhotoUrl(photo.id)}
                      alt=""
                      className={cn(
                        "size-20 rounded-lg border object-cover transition-opacity",
                        markedForRemoval && "opacity-30",
                      )}
                    />
                    {markedForRemoval && (
                      <input
                        type="hidden"
                        name="removePhotoIds"
                        value={photo.id}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => togglePhotoRemoval(photo.id)}
                      disabled={isSubmitting}
                      aria-label={
                        markedForRemoval ? "Keep this photo" : "Remove this photo"
                      }
                      className="absolute -right-1.5 -top-1.5 cursor-pointer rounded-full border bg-white p-1 shadow-sm hover:text-destructive"
                    >
                      <Trash2Icon className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
            {photoIdsToRemove.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {photoIdsToRemove.length} photo
                {photoIdsToRemove.length === 1 ? "" : "s"} will be deleted when
                you save.
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="photos">Add photos</Label>
          <Input
            id="photos"
            name="photos"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="bg-white"
            disabled={isSubmitting || remainingPhotoSlots === 0}
            onChange={(event) =>
              setNewPhotoCount(event.target.files?.length ?? 0)
            }
          />
          <p className="text-xs text-muted-foreground">
            {remainingPhotoSlots === 0
              ? `This listing already has ${MAX_PHOTOS} photos. Remove one to add another.`
              : `Optional. Up to ${remainingPhotoSlots} more photo${remainingPhotoSlots === 1 ? "" : "s"}, 5MB each.`}
            {newPhotoCount > 0 &&
              ` ${newPhotoCount} selected${newPhotoCount > remainingPhotoSlots ? ` — only the first ${remainingPhotoSlots} will be saved.` : "."}`}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="cta"
            className="flex-1"
            disabled={
              isSubmitting ||
              (selectedServiceIds.length === 0 && newServices.trim() === "")
            }
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Add contractor"}
          </Button>
        </div>
      </fetcher.Form>
    </ResponsiveOverlay>
  );
}
