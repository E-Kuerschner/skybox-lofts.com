import { Chip } from "~/components/Chip";
import { cn } from "~/util/ui/utils";
import type { ContractorService } from "./types";

/** The services a business offers, as a wrap of small accent tags. */
export function ServiceTags({
  services,
  className,
}: {
  services: ContractorService[];
  className?: string;
}) {
  if (services.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {services.map((service) => (
        <li key={service.slug}>
          <Chip>{service.name}</Chip>
        </li>
      ))}
    </ul>
  );
}
