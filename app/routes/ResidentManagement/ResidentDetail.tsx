import { BadgeCheckIcon, ClockIcon, HomeIcon, PencilIcon } from "lucide-react";
import { ActionButton } from "~/components/ActionButton";
import { AdminOnly } from "~/components/AdminOnly";
import { Chip } from "~/components/Chip";
import { ContactButton } from "~/components/ContactButton";
import { InfoList, InfoRow } from "~/components/InfoList";
import {
  OverlayCloseButton,
  OverlayFooter,
} from "~/components/ResponsiveOverlay";
import { Button } from "~/components/ui/button";
import { contactHref } from "~/util/contactLinks";
import type { Resident } from "./types";

/**
 * Everything about one resident: who they are, how to reach them, where they
 * live and whether they've accepted their invitation. Admins can edit or
 * remove them from here.
 *
 * Meant for a `ResponsiveOverlay` with `hideHeader` and `bare` - it draws its
 * own top and footer.
 */
export function ResidentDetail({
  resident,
  onEdit,
  onRemove,
}: {
  resident: Resident;
  onEdit: (resident: Resident) => void;
  onRemove: (resident: Resident) => void;
}) {
  const name = resident.name || "Unnamed resident";

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex items-start justify-between gap-4 px-5 pt-5 md:px-6 md:pt-6">
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-2xl font-semibold leading-tight">{name}</h2>
            <div className="flex flex-wrap gap-1.5">
              {resident.role && (
                <Chip variant="neutral" className="capitalize">
                  {resident.role}
                </Chip>
              )}
              {resident.boardPosition && (
                <Chip>Board {resident.boardPosition}</Chip>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <AdminOnly>
              <Button
                variant="outline"
                className="h-9 md:h-9 rounded-full"
                onClick={() => onEdit(resident)}
              >
                <PencilIcon />
                Edit
              </Button>
            </AdminOnly>
            <OverlayCloseButton />
          </div>
        </div>

        <div className="flex flex-col gap-5 px-5 pt-5 pb-6 md:px-6">
          <InfoList>
            {resident.emailVerified ? (
              <InfoRow
                icon={BadgeCheckIcon}
                tone="positive"
                label="Status"
                value="Verified"
              />
            ) : (
              <InfoRow
                icon={ClockIcon}
                tone="warning"
                label="Status"
                value="Invitation sent, awaiting acceptance"
              />
            )}
            <InfoRow
              leading={
                <ContactButton
                  kind="email"
                  value={resident.email}
                  name={name}
                  shape="square"
                />
              }
              label="Email"
              value={resident.email}
              href={contactHref("email", resident.email)}
            />
            <InfoRow
              icon={HomeIcon}
              label="Unit"
              value={resident.unitNumber ?? "Not set"}
            />
          </InfoList>
        </div>
      </div>

      <AdminOnly>
        <OverlayFooter>
          <RemoveControl resident={resident} onRemove={onRemove} />
        </OverlayFooter>
      </AdminOnly>
    </>
  );
}

/**
 * Remove, or a sentence explaining why it isn't offered - the server refuses
 * to remove admins and board members.
 */
function RemoveControl({
  resident,
  onRemove,
}: {
  resident: Resident;
  onRemove: (resident: Resident) => void;
}) {
  if (resident.role === "admin") {
    return (
      <p className="text-sm text-muted-foreground">
        Admins can't be removed. Change their role first.
      </p>
    );
  }

  if (resident.isBoardMember) {
    return (
      <p className="text-sm text-muted-foreground">
        To remove this resident, first take them off the board.
      </p>
    );
  }

  return (
    <ActionButton
      type="button"
      variant="ghost"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={() => onRemove(resident)}
    >
      Remove resident
    </ActionButton>
  );
}
