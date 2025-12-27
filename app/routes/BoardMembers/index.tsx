import type { Route } from "./+types/index";
import { getDatabase } from "~/util/database.server";
import { isAuthenticated } from "~/util/authHelpers.server";
import * as schema from "../../../database/schema";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { createActivityLogData } from "~/util/activityLogger.server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Form } from "react-router";
import { Edit3Icon } from "lucide-react";
import { BoardPositionAssignment } from "./BoardPositionAssignment";
import { BoardAssignmentForm } from "./BoardAssignmentForm";
import { ResponsiveOverlay } from "~/components/ResponsiveOverlay";
import { StatusBanner } from "~/components/StatusBanner";

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await isAuthenticated(request, context);
  const db = getDatabase(context);

  // Fetch all board members (with nullable userId and name)
  const boardMemberData = await db
    .select()
    .from(schema.boardMembers)
    .all();

  // Fetch all email-verified residents for the assignment combobox
  // Note: emailVerified is a boolean in SQLite (0 or 1), so we check for truthy values
  const allUsers = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      emailVerified: schema.users.emailVerified,
    })
    .from(schema.users)
    .all();

  const verifiedResidents = allUsers.filter((user) => user.emailVerified);

  return {
    boardMemberData,
    verifiedResidents,
    isAdmin: session.user.role === "admin",
  };
}

async function handleAssignBoardPosition(
  boardMemberId: string,
  userId: string | null,
  db: ReturnType<typeof getDatabase>,
  actorUserId: string,
) {
  if (!boardMemberId) {
    return { error: "Board position ID is required" };
  }

  try {
    const position = await db
      .select()
      .from(schema.boardMembers)
      .where(eq(schema.boardMembers.id, Number(boardMemberId)))
      .get();

    if (!position) {
      return { error: "Board position not found" };
    }

    // Handle unassignment (make vacant)
    if (!userId) {
      const previousUserId = position.userId;

      // Set position to vacant
      await db
        .update(schema.boardMembers)
        .set({
          userId: null,
          name: null,
        })
        .where(eq(schema.boardMembers.id, Number(boardMemberId)));

      // Downgrade previous user to owner
      if (previousUserId) {
        await db
          .update(schema.users)
          .set({ role: "owner" })
          .where(eq(schema.users.id, previousUserId));

        // Log the unassignment
        await db.insert(schema.activityLogs).values(
          createActivityLogData(actorUserId, "updated", "board_member", boardMemberId, {
            position: position.role,
            previousUserId,
            note: "unassigned",
          })
        );
      }

      return { success: true, message: "Board position is now vacant" };
    }

    // Handle assignment
    // Check if user exists and is verified
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();

    if (!user) {
      return { error: "User not found" };
    }

    if (!user.emailVerified) {
      return { error: "User must have a verified email to be assigned to a board position" };
    }

    // Check if user already has a board position (one position per user)
    const existingPosition = await db
      .select()
      .from(schema.boardMembers)
      .where(eq(schema.boardMembers.userId, userId))
      .get();

    if (existingPosition) {
      return {
        error: `${user.name} is already assigned to ${existingPosition.role}. Users can only hold one board position at a time.`,
      };
    }

    // If position already has someone, downgrade them to owner
    if (position.userId) {
      await db
        .update(schema.users)
        .set({ role: "owner" })
        .where(eq(schema.users.id, position.userId));
    }

    // Assign user to position
    await db
      .update(schema.boardMembers)
      .set({
        userId: userId,
        name: user.name,
      })
      .where(eq(schema.boardMembers.id, Number(boardMemberId)));

    // Upgrade user to admin if not already
    if (user.role !== "admin") {
      await db
        .update(schema.users)
        .set({ role: "admin" })
        .where(eq(schema.users.id, userId));
    }

    // Log the assignment
    await db.insert(schema.activityLogs).values(
      createActivityLogData(actorUserId, "updated", "board_member", boardMemberId, {
        position: position.role,
        assignedUserId: userId,
        assignedUserName: user.name,
        note: "assigned",
      })
    );

    return { success: true, message: `${user.name} assigned to ${position.role}` };
  } catch (error) {
    console.error("Error assigning board position:", error);
    return { error: "Failed to assign board position" };
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  const session = await isAuthenticated(request, context);

  // Admin-only protection
  if (session.user.role !== "admin") {
    return { error: "Permission denied. Only admins can modify board positions." };
  }

  const db = getDatabase(context);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "assign") {
    const boardMemberId = formData.get("boardMemberId") as string;
    const userId = formData.get("userId") as string | null;
    return handleAssignBoardPosition(boardMemberId, userId, db, session.user.id);
  }

  return { error: "Invalid action" };
}

export default function BoardMembers({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [editMode, setEditMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    id: number;
    title: string;
    userId: string | null;
    userName: string | null;
  } | null>(null);

  const handleAssignmentChange = (
    boardMemberId: number,
    userId: string | null,
    userName: string | null,
  ) => {
    const position = loaderData.boardMemberData.find(
      (m: { id: number; role: string }) => m.id === boardMemberId
    );
    if (!position) return;

    setSelectedPosition({
      id: boardMemberId,
      title: position.role,
      userId,
      userName,
    });
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col">
      {actionData?.error && (
        <StatusBanner
          className="mb-4"
          variant="error"
          message={actionData.error}
        />
      )}
      {actionData && "success" in actionData && actionData.success && (
        <StatusBanner
          className="mb-4"
          variant="success"
          message={"message" in actionData ? actionData.message : "Operation completed successfully"}
          autoDismiss={3000}
        />
      )}

      <div className="bg-white rounded-xl px-4 pt-4 border-1 pb-8 shadow-md">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <p className="text-muted-foreground">
            Serving on the HOA board is voluntary. If you are interested in
            helping our community, please contact any of the current board
            members.
          </p>
          {/* Admin Edit Button */}
          {loaderData.isAdmin && (
            <Button
              variant={editMode ? "outline" : "secondary"}
              onClick={() => setEditMode((prev) => !prev)}
            >
              {editMode ? (
                "Done"
              ) : (
                <>
                  <Edit3Icon className="size-4 mr-2" />
                  Make changes
                </>
              )}
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="*:font-bold px-4">
              <TableHead>Position</TableHead>
              <TableHead>{editMode ? "Assign Resident" : "Name"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loaderData.boardMemberData.map((member: { id: number; name: string | null; role: string; userId: string | null }) => (
              <TableRow key={member.id}>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  {editMode ? (
                    <BoardPositionAssignment
                      boardMemberId={member.id}
                      currentUserId={member.userId}
                      currentUserName={member.name}
                      verifiedResidents={loaderData.verifiedResidents}
                      onAssignmentChange={handleAssignmentChange}
                    />
                  ) : (
                    member.name || (
                      <span className="text-muted-foreground italic">Vacant</span>
                    )
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Assignment Confirmation Overlay (dialog on desktop, drawer on mobile) */}
      {selectedPosition && (
        <ResponsiveOverlay
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={
            selectedPosition.userId === null
              ? "Remove Board Member?"
              : "Assign Board Member?"
          }
        >
          <BoardAssignmentForm
            boardMemberId={selectedPosition.id}
            positionTitle={selectedPosition.title}
            assignedUserId={selectedPosition.userId}
            assignedUserName={selectedPosition.userName}
            isUnassignment={selectedPosition.userId === null}
            onCancel={() => setDialogOpen(false)}
          />
        </ResponsiveOverlay>
      )}
    </div>
  );
}
