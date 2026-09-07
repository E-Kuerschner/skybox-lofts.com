import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { contractorPhotoUrl } from "~/util/contractorPhotoUrl";
import { ServiceBadges } from "./ServiceFilterChips";
import { ContractorMapPreview } from "./ContractorMap";
import type { ContractorListing } from "./types";

export function ContractorDetail({
  contractor,
  googleMapsApiKey,
}: {
  contractor: ContractorListing;
  googleMapsApiKey: string | null;
}) {
  return (
    <div className="space-y-4 overflow-y-auto pt-2 max-h-[70vh]">
      {contractor.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {contractor.photos.map((photo) => (
            <a
              key={photo.id}
              href={contractorPhotoUrl(photo.id)}
              target="_blank"
              rel="noreferrer"
              className="shrink-0"
            >
              <img
                src={contractorPhotoUrl(photo.id)}
                alt={`Work by ${contractor.businessName}`}
                loading="lazy"
                className="h-36 w-auto rounded-lg border object-cover"
              />
            </a>
          ))}
        </div>
      )}

      {contractor.contactName && (
        <p className="text-sm text-muted-foreground">
          Ask for {contractor.contactName}
        </p>
      )}

      <div>
        <h3 className="mb-1.5 text-sm font-semibold">Services offered</h3>
        <ServiceBadges services={contractor.services} />
      </div>

      <div className="space-y-2 text-sm">
        {contractor.phone && (
          <a
            href={`tel:${contractor.phone.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-2 text-emerald-700 hover:underline"
          >
            <PhoneIcon className="size-4 shrink-0" />
            {contractor.phone}
          </a>
        )}
        {contractor.email && (
          <a
            href={`mailto:${contractor.email}`}
            className="flex items-center gap-2 text-emerald-700 hover:underline"
          >
            <MailIcon className="size-4 shrink-0" />
            <span className="break-all">{contractor.email}</span>
          </a>
        )}
        {contractor.address && (
          <p className="flex items-start gap-2">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>{contractor.address}</span>
          </p>
        )}
      </div>

      {contractor.notes && (
        <div>
          <h3 className="mb-1 text-sm font-semibold">Good to know</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {contractor.notes}
          </p>
        </div>
      )}

      {contractor.address && (
        <ContractorMapPreview
          address={contractor.address}
          businessName={contractor.businessName}
          apiKey={googleMapsApiKey}
        />
      )}
    </div>
  );
}
