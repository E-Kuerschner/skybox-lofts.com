import { ChevronRightIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { IconButton } from "~/components/IconButton";
import { whyNotRemovable, type Resident } from "./types";

/**
 * One resident in the list. Tapping it opens their details; on larger screens
 * Edit and Remove sit on the card too, one click away.
 */
export function ResidentCard({
  user,
  onOpenDetails,
  onEdit,
  onRemove,
}: {
  user: Resident;
  onOpenDetails: (user: Resident) => void;
  onEdit: (user: Resident) => void;
  onRemove: (user: Resident) => void;
}) {
  const name = user.name || "Unnamed User";
  const blockedReason = whyNotRemovable(user);

  return (
    <div className="relative flex w-full items-center justify-between bg-card border rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors shadow-sm">
      {/* The whole card opens the details; the action buttons sit above. */}
      <button
        type="button"
        onClick={() => onOpenDetails(user)}
        className="absolute inset-0 cursor-pointer rounded-lg"
        aria-label={`See details for ${name}`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="font-medium text-foreground truncate">{name}</h3>
          {user.emailVerified ? (
            <span className="text-xs text-positive-foreground shrink-0">
              Verified
            </span>
          ) : (
            <span className="text-xs text-warning-foreground shrink-0">
              Pending
            </span>
          )}
          {user.isBoardMember && user.boardPosition && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
              Board: {user.boardPosition}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <span className="text-xs text-muted-foreground shrink-0">
            • Unit {user.unitNumber ?? 0}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className="text-sm text-muted-foreground capitalize hidden sm:inline">
          {user.role || ""}
        </span>
        <ChevronRightIcon className="size-4 text-muted-foreground md:hidden" />
        <div className="relative z-10 hidden gap-1 md:flex">
          <IconButton
            icon={PencilIcon}
            label={`Edit ${name}`}
            onClick={() => onEdit(user)}
          />
          {/* A disabled button shows no tooltip, so the reason sits on a
              wrapper instead. */}
          <span title={blockedReason ?? undefined}>
            <IconButton
              icon={Trash2Icon}
              tone="destructive"
              label={blockedReason ?? `Remove ${name}`}
              disabled={blockedReason !== null}
              onClick={() => onRemove(user)}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
