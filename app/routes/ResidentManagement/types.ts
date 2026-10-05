import type { Route } from "./+types/index";

/** One resident as the management page's loader returns them. */
export type Resident = Route.ComponentProps["loaderData"]["users"][number];

/**
 * Why this resident can't be removed, or null when they can. Mirrors the
 * server, which refuses to remove admins and board members.
 */
export function whyNotRemovable(resident: Resident): string | null {
  if (resident.role === "admin") {
    return "Admins can't be removed. Change their role first.";
  }
  if (resident.isBoardMember) {
    return "To remove this resident, first take them off the board.";
  }
  return null;
}
