import { PencilIcon } from "lucide-react";
import { AdminOnly } from "~/components/AdminOnly";
import { Avatar } from "~/components/Avatar";
import { ContactButton } from "~/components/ContactButton";
import { IconButton } from "~/components/IconButton";
import type { BoardSeat } from "./types";

/**
 * The board, one row per seat: who holds it and a button to email them. An
 * open seat says so. Admins get a pencil on each row to change who holds it.
 */
export function BoardSeatList({
  seats,
  onChange,
}: {
  seats: BoardSeat[];
  onChange: (seat: BoardSeat) => void;
}) {
  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
      {seats.map((seat) => (
        <li key={seat.id} className="flex items-center gap-3 py-3.5 pr-3 pl-4">
          <Avatar name={seat.userId ? seat.name : null} />

          <div className="flex min-w-0 grow flex-col gap-0.5">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {seat.role}
            </span>
            {seat.userId ? (
              <>
                <span className="truncate font-medium">
                  {seat.name || seat.email}
                </span>
                {seat.unitNumber && (
                  <span className="text-[13px] text-muted-foreground">
                    Unit {seat.unitNumber}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="font-medium text-muted-foreground italic">
                  Open seat
                </span>
                <span className="text-[13px] text-muted-foreground">
                  Interested? Let any board member know.
                </span>
              </>
            )}
          </div>

          {seat.email && (
            <ContactButton
              kind="email"
              value={seat.email}
              name={seat.name || seat.email}
            />
          )}

          <AdminOnly>
            <IconButton
              icon={PencilIcon}
              label={`Change who is ${seat.role}`}
              onClick={() => onChange(seat)}
            />
          </AdminOnly>
        </li>
      ))}
    </ul>
  );
}
