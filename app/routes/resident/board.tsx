import type { Route } from "./+types/board";
import { ContentCard } from "~/components/ContentCard";
import { getDatabase } from "~/util/database.server";
import { isAuthenticated } from "~/util/authHelpers.server";
import { boardMembers } from "../../../database/schema";

export async function loader({ request, context }: Route.LoaderArgs) {
  await isAuthenticated(request, context);
  const db = getDatabase(context);

  const boardMemberData = await db.select().from(boardMembers);
  return {
    boardMemberData,
  };
}

export default function BoardMembersPage({ loaderData }: Route.ComponentProps) {
  return (
    <ContentCard>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-3 text-left text-sm font-semibold text-foreground">
              Name
            </th>
            <th className="pb-3 text-left text-sm font-semibold text-foreground">
              Position
            </th>
          </tr>
        </thead>
        <tbody>
          {loaderData.boardMemberData.map((member) => (
            <tr className="border-b border-border">
              <td className="py-3 text-sm text-foreground">{member.name}</td>
              <td className="py-3 text-sm text-muted-foreground">
                {member.role}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ContentCard>
  );
}
