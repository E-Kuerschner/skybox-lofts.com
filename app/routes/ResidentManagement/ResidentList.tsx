import { ChevronRightIcon } from "lucide-react";
import { AccessStatus } from "./AccessStatus";
import type { Resident } from "./types";

/**
 * The residents as a list, for phones, where the table's columns don't fit.
 * Each row folds the columns into lines; tapping it opens the details, where
 * Edit and Remove live.
 */
export function ResidentList({
  residents,
  onOpenDetails,
}: {
  residents: Resident[];
  onOpenDetails: (resident: Resident) => void;
}) {
  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
      {residents.map((resident) => {
        const name = resident.name || "Unnamed resident";
        const details = [
          resident.unitNumber !== null && `Unit ${resident.unitNumber}`,
          resident.role,
          resident.boardPosition,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <li key={resident.id}>
            <button
              type="button"
              onClick={() => onOpenDetails(resident)}
              aria-label={`See details for ${name}`}
              className="flex w-full cursor-pointer items-center gap-3 py-3.5 pr-3 pl-4 text-left active:bg-muted/50"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{name}</span>
                  <AccessStatus resident={resident} className="text-xs" />
                </span>
                <span className="text-[13px] capitalize text-foreground/80">
                  {details}
                </span>
                <span className="truncate text-[13px] text-muted-foreground">
                  {resident.email}
                </span>
              </span>
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
