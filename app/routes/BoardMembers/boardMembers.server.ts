import { asc, eq } from "drizzle-orm";
import * as schema from "../../../database/schema";
import { CRUD_RECORD_ID_FIELD } from "~/components/crud/CrudFormDialog";
import { createActivityLogData } from "~/util/activityLogger.server";
import { actionError, actionSuccess } from "~/util/crud/actionResult";
import type { AdminActionArgs } from "~/util/crud/adminAction.server";
import type { getDatabase } from "~/util/database.server";
import { SEAT_HOLDER_FIELD, type BoardSeat, type SeatCandidate } from "./types";

type Database = ReturnType<typeof getDatabase>;

/** A unit number of 0 means it was never filled in. */
const unitOrNull = (unit: number | null) => (unit ? unit : null);

/** Every seat on the board with its holder's contact details. */
export async function fetchBoardSeats(db: Database): Promise<BoardSeat[]> {
  const rows = await db
    .select({
      id: schema.boardMembers.id,
      role: schema.boardMembers.role,
      userId: schema.boardMembers.userId,
      name: schema.users.name,
      email: schema.users.email,
      unitNumber: schema.users.unitNumber,
    })
    .from(schema.boardMembers)
    .leftJoin(schema.users, eq(schema.boardMembers.userId, schema.users.id))
    .orderBy(asc(schema.boardMembers.id))
    .all();

  return rows.map((row) => ({ ...row, unitNumber: unitOrNull(row.unitNumber) }));
}

/** Everyone who could be given a seat: residents who have signed in before. */
export async function fetchSeatCandidates(
  db: Database,
): Promise<SeatCandidate[]> {
  const users = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      unitNumber: schema.users.unitNumber,
      emailVerified: schema.users.emailVerified,
    })
    .from(schema.users)
    .orderBy(asc(schema.users.name))
    .all();

  return users
    .filter((user) => user.emailVerified)
    .map(({ emailVerified: _, ...user }) => ({
      ...user,
      unitNumber: unitOrNull(user.unitNumber),
    }));
}

/**
 * Gives a seat to someone, or leaves it open. Whoever takes a seat becomes an
 * admin; whoever leaves one goes back to being an owner.
 */
export async function updateBoardSeat({
  formData,
  db,
  session,
}: AdminActionArgs) {
  const seatId = Number(formData.get(CRUD_RECORD_ID_FIELD));
  const userId = (formData.get(SEAT_HOLDER_FIELD) as string | null) || null;

  const seat = await db
    .select()
    .from(schema.boardMembers)
    .where(eq(schema.boardMembers.id, seatId))
    .get();

  if (!seat) {
    return actionError(
      "We couldn't find that board seat. Please refresh and try again.",
    );
  }

  if (userId === seat.userId) {
    return actionSuccess("Nothing changed.");
  }

  const previousUserId = seat.userId;

  if (!userId) {
    await db
      .update(schema.boardMembers)
      .set({ userId: null, name: null })
      .where(eq(schema.boardMembers.id, seatId));

    if (previousUserId) {
      await db
        .update(schema.users)
        .set({ role: "owner" })
        .where(eq(schema.users.id, previousUserId));

      await db.insert(schema.activityLogs).values(
        createActivityLogData(
          session.user.id,
          "updated",
          "board_member",
          String(seatId),
          { position: seat.role, previousUserId, note: "unassigned" },
        ),
      );
    }

    return actionSuccess(`The ${seat.role} seat is now open.`);
  }

  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .get();

  if (!user) {
    return actionError(
      "We couldn't find that resident. Please refresh and try again.",
    );
  }

  if (!user.emailVerified) {
    return actionError(
      `${user.name} needs to sign in to the website at least once before they can join the board.`,
    );
  }

  // One seat per person
  const otherSeat = await db
    .select()
    .from(schema.boardMembers)
    .where(eq(schema.boardMembers.userId, userId))
    .get();

  if (otherSeat) {
    return actionError(
      `${user.name} is already the ${otherSeat.role}. Each person can only hold one seat on the board.`,
    );
  }

  if (previousUserId) {
    await db
      .update(schema.users)
      .set({ role: "owner" })
      .where(eq(schema.users.id, previousUserId));
  }

  await db
    .update(schema.boardMembers)
    .set({ userId, name: user.name })
    .where(eq(schema.boardMembers.id, seatId));

  if (user.role !== "admin") {
    await db
      .update(schema.users)
      .set({ role: "admin" })
      .where(eq(schema.users.id, userId));
  }

  await db.insert(schema.activityLogs).values(
    createActivityLogData(
      session.user.id,
      "updated",
      "board_member",
      String(seatId),
      {
        position: seat.role,
        assignedUserId: userId,
        assignedUserName: user.name,
        note: "assigned",
      },
    ),
  );

  return actionSuccess(`${user.name} is now the ${seat.role}.`);
}
