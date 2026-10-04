import { useState } from "react";
import { PencilIcon } from "lucide-react";
import { AdminOnly } from "~/components/AdminOnly";
import { OverlayCloseButton } from "~/components/ResponsiveOverlay";
import { Button } from "~/components/ui/button";
import { contractorPhotoUrl } from "~/util/contractorPhotoUrl";
import { cn } from "~/util/ui/utils";
import { ContactCells } from "./ContactCells";
import { ServiceTags } from "./ServiceTags";
import type { ContractorListing } from "./types";

/**
 * Everything about one business: its photos, the services it offers, every
 * way to reach it, and anything worth knowing first. Board admins can jump
 * straight to editing it from here.
 *
 * Meant for a `ResponsiveOverlay` with `hideHeader` - it draws its own top,
 * with the cover photo when there is one.
 */
export function ContractorDetail({
  contractor,
  onEdit,
}: {
  contractor: ContractorListing;
  onEdit: (contractor: ContractorListing) => void;
}) {
  const hasPhotos = contractor.photos.length > 0;

  const actions = (floating: boolean) => (
    <div className="flex shrink-0 items-center gap-2">
      <AdminOnly>
        <Button
          variant="outline"
          className={cn(
            "h-9 md:h-9 rounded-full",
            floating && "border-transparent shadow-sm",
          )}
          onClick={() => onEdit(contractor)}
        >
          <PencilIcon />
          Edit
        </Button>
      </AdminOnly>
      <OverlayCloseButton floating={floating} />
    </div>
  );

  const nameAndServices = (
    <div className="flex min-w-0 flex-col gap-2">
      <h2 className="text-2xl font-semibold leading-tight">
        {contractor.businessName}
      </h2>
      <ServiceTags services={contractor.services} />
    </div>
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {hasPhotos ? (
        <div className="relative">
          <PhotoStrip contractor={contractor} />
          <div className="absolute top-3 right-3">{actions(true)}</div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 md:px-6 md:pt-6">
          {nameAndServices}
          {actions(false)}
        </div>
      )}

      <div className="flex flex-col gap-5 px-5 pt-5 pb-6 md:px-6">
        {hasPhotos && nameAndServices}

        <ContactCells contractor={contractor} />

        {contractor.notes && (
          <div className="rounded-xl border bg-muted/40 px-3.5 py-3">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Good to know
            </h3>
            <p className="text-sm whitespace-pre-line text-foreground/80">
              {contractor.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The listing's photos, full width, swiped (or scrolled) through one at a
 * time, with a counter so it's clear there are more.
 */
function PhotoStrip({ contractor }: { contractor: ContractorListing }) {
  const [index, setIndex] = useState(0);
  const { photos } = contractor;

  return (
    <div className="relative">
      <div
        className="flex h-48 snap-x snap-mandatory overflow-x-auto bg-muted md:h-52"
        onScroll={(event) => {
          const strip = event.currentTarget;
          setIndex(Math.round(strip.scrollLeft / strip.clientWidth));
        }}
      >
        {photos.map((photo, photoIndex) => (
          <a
            key={photo.id}
            href={contractorPhotoUrl(photo.id)}
            target="_blank"
            rel="noreferrer"
            className="size-full shrink-0 snap-center"
            aria-label={`Open photo ${photoIndex + 1} of ${photos.length} full size`}
          >
            <img
              src={contractorPhotoUrl(photo.id)}
              alt={`Work by ${contractor.businessName}`}
              loading={photoIndex === 0 ? "eager" : "lazy"}
              className="size-full object-cover"
            />
          </a>
        ))}
      </div>
      {photos.length > 1 && (
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-medium text-background">
          {index + 1} of {photos.length} photos
        </span>
      )}
    </div>
  );
}
