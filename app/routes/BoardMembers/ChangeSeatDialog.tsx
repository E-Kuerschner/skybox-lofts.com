import { useEffect, useState } from "react";
import { Callout } from "~/components/Callout";
import { CrudFormDialog } from "~/components/crud/CrudFormDialog";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SEAT_HOLDER_FIELD, type BoardSeat, type SeatCandidate } from "./types";

// Radix Select can't use an empty string as a value
const OPEN_SEAT = "open";

const displayName = (person: { name: string | null; email: string | null }) =>
  person.name || person.email || "this resident";

/**
 * Lets an admin pick who holds a seat, or leave it open, and spells out the
 * admin access that comes and goes with it before they save.
 */
export function ChangeSeatDialog({
  open,
  onOpenChange,
  seat,
  seats,
  candidates,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seat: BoardSeat | null;
  /** Every seat, so people already on the board aren't offered another one. */
  seats: BoardSeat[];
  candidates: SeatCandidate[];
  onSuccess: (message: string) => void;
}) {
  const current = seat?.userId ?? OPEN_SEAT;
  const [choice, setChoice] = useState(current);

  useEffect(() => {
    if (open) setChoice(current);
  }, [open, current]);

  const onOtherSeats = new Set(
    seats
      .filter((other) => other.id !== seat?.id && other.userId)
      .map((other) => other.userId),
  );
  const options = candidates.filter((person) => !onOtherSeats.has(person.id));
  const picked = options.find((person) => person.id === choice);

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      entityName="board seat"
      recordId={seat?.id}
      title={seat ? `Change the ${seat.role}` : "Change a board seat"}
      description="Pick who should hold this seat."
      submitLabel={choice === OPEN_SEAT ? "Leave seat open" : "Save"}
      submitDisabled={choice === current}
      onSuccess={onSuccess}
    >
      <input
        type="hidden"
        name={SEAT_HOLDER_FIELD}
        value={choice === OPEN_SEAT ? "" : choice}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="seat-holder">{seat?.role}</Label>
        <Select value={choice} onValueChange={setChoice}>
          <SelectTrigger id="seat-holder" className="h-11 w-full bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {displayName(person)}
                {person.id === seat?.userId
                  ? " (holds this seat now)"
                  : person.unitNumber && ` · Unit ${person.unitNumber}`}
              </SelectItem>
            ))}
            <SelectItem value={OPEN_SEAT}>
              Nobody, leave this seat open
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Only residents who have signed in at least once show up here.
        </p>
      </div>

      {seat && choice !== current && (
        <Callout tone="warning" title="What this changes">
          <ul className="list-disc space-y-1 pl-4">
            {picked && (
              <li>
                {displayName(picked)} becomes an admin and can manage the
                website.
              </li>
            )}
            {seat.userId && (
              <li>{displayName(seat)} goes back to being a regular owner.</li>
            )}
          </ul>
        </Callout>
      )}
    </CrudFormDialog>
  );
}
