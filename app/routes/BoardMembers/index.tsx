import { useState } from "react";
import type { Route } from "./+types/index";
import { useStatusBanner } from "~/components/crud/ActionStatusBanner";
import { isAuthenticated } from "~/util/authHelpers.server";
import { runAdminAction } from "~/util/crud/adminAction.server";
import { getDatabase } from "~/util/database.server";
import {
  fetchBoardSeats,
  fetchSeatCandidates,
  updateBoardSeat,
} from "./boardMembers.server";
import { BoardSeatList } from "./BoardSeatList";
import { ChangeSeatDialog } from "./ChangeSeatDialog";
import type { BoardSeat } from "./types";

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await isAuthenticated(request, context);
  const db = getDatabase(context);
  const isAdmin = session.user.role === "admin";

  return {
    seats: await fetchBoardSeats(db),
    // Only admins pick who holds a seat, so only they need the list of people
    candidates: isAdmin ? await fetchSeatCandidates(db) : [],
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  return runAdminAction(
    { request, context },
    { update: updateBoardSeat },
    {
      forbiddenMessage:
        "Only building administrators can change who is on the board. If you think you should have access, please contact a board member.",
    },
  );
}

export default function BoardMembers({ loaderData }: Route.ComponentProps) {
  const { seats, candidates } = loaderData;
  const { banner, showSuccess } = useStatusBanner();
  const [seatToChange, setSeatToChange] = useState<BoardSeat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex max-w-[720px] flex-col gap-4">
      {banner}

      <p className="text-muted-foreground">
        Serving on the HOA board is voluntary. If you are interested in helping
        our community, please contact any of the current board members.
      </p>

      <BoardSeatList
        seats={seats}
        onChange={(seat) => {
          setSeatToChange(seat);
          setIsDialogOpen(true);
        }}
      />

      <ChangeSeatDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        seat={seatToChange}
        seats={seats}
        candidates={candidates}
        onSuccess={showSuccess}
      />
    </div>
  );
}
