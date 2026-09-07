import { ImageIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { AdminOnly } from "~/components/AdminEditing";
import { contractorPhotoUrl } from "~/util/contractorPhotoUrl";
import { cn } from "~/util/ui/utils";
import { ServiceBadges } from "./ServiceFilterChips";
import type { ContractorListing } from "./types";

export function ContractorCard({
  contractor,
  highlightSlugs,
  onOpenDetails,
  onEdit,
  onDelete,
}: {
  contractor: ContractorListing;
  highlightSlugs?: string[];
  onOpenDetails: (contractor: ContractorListing) => void;
  onEdit: (contractor: ContractorListing) => void;
  onDelete: (contractor: ContractorListing) => void;
}) {
  const coverPhoto = contractor.photos[0];

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => onOpenDetails(contractor)}
        className="flex cursor-pointer flex-col items-stretch text-left"
        aria-label={`See details for ${contractor.businessName}`}
      >
        <div
          className={cn(
            "flex h-32 items-center justify-center bg-muted",
            !coverPhoto && "text-muted-foreground",
          )}
        >
          {coverPhoto ? (
            <img
              src={contractorPhotoUrl(coverPhoto.id)}
              alt={`Work by ${contractor.businessName}`}
              loading="lazy"
              className="h-32 w-full object-cover"
            />
          ) : (
            <ImageIcon className="size-6" />
          )}
        </div>

        <div className="px-4 pt-3">
          <h3 className="font-semibold leading-snug">
            {contractor.businessName}
          </h3>
          {contractor.contactName && (
            <p className="text-sm text-muted-foreground">
              {contractor.contactName}
            </p>
          )}
        </div>
      </button>

      <div className="flex grow flex-col gap-3 px-4 pb-4 pt-3">
        <ServiceBadges
          services={contractor.services}
          highlightSlugs={highlightSlugs}
        />

        <div className="mt-auto space-y-1.5 text-sm">
          {contractor.phone && (
            <a
              href={`tel:${contractor.phone.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-2 text-emerald-700 hover:underline"
            >
              <PhoneIcon className="size-3.5 shrink-0" />
              {contractor.phone}
            </a>
          )}
          {contractor.email && (
            <a
              href={`mailto:${contractor.email}`}
              className="flex items-center gap-2 text-emerald-700 hover:underline"
            >
              <MailIcon className="size-3.5 shrink-0" />
              <span className="truncate">{contractor.email}</span>
            </a>
          )}
          {contractor.address && (
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
              <span>{contractor.address}</span>
            </p>
          )}
        </div>

        <AdminOnly>
          <div className="flex gap-2 border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(contractor)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(contractor)}
            >
              Remove
            </Button>
          </div>
        </AdminOnly>
      </div>
    </article>
  );
}
