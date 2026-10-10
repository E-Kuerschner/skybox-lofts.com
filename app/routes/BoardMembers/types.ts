/** A seat on the board and whoever holds it, if anyone. */
export type BoardSeat = {
  id: number;
  /** The position, e.g. "Treasurer". */
  role: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  unitNumber: number | null;
};

/** Someone who can be given a seat: residents who have signed in before. */
export type SeatCandidate = {
  id: string;
  name: string | null;
  email: string;
  unitNumber: number | null;
};

/** The form field holding who should hold a seat; empty leaves it open. */
export const SEAT_HOLDER_FIELD = "userId";
