type Props = {
  boardMemberId: number;
  positionTitle: string;
  assignedUserId: string | null;
  assignedUserName: string | null;
  isUnassignment: boolean;
};

/**
 * The fields of the assign / remove form: the explanation of what will happen
 * plus the hidden inputs it posts. The dialog wraps these in a `<Form>` and
 * pins the Cancel / confirm buttons in its footer.
 */
export function BoardAssignmentForm({
  boardMemberId,
  positionTitle,
  assignedUserId,
  assignedUserName,
  isUnassignment,
}: Props) {
  return (
    <>
      <div className="text-sm text-muted-foreground">
        {isUnassignment ? (
          <>
            Are you sure you want to remove the current board member from the{" "}
            <strong>{positionTitle}</strong> position?
            <br />
            <br />
            This will:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Make the position vacant</li>
              <li>
                <strong>Downgrade their role to Owner</strong> (they will lose
                admin permissions)
              </li>
            </ul>
          </>
        ) : (
          <>
            Are you sure you want to assign <strong>{assignedUserName}</strong>{" "}
            to the <strong>{positionTitle}</strong> position?
            <br />
            <br />
            This will:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Add them to the board</li>
              <li>
                <strong>Upgrade their role to Admin</strong> (they will gain
                admin permissions)
              </li>
            </ul>
          </>
        )}
      </div>

      <input type="hidden" name="intent" value="assign" />
      <input type="hidden" name="boardMemberId" value={boardMemberId} />
      <input
        type="hidden"
        name="userId"
        value={isUnassignment ? "" : assignedUserId || ""}
      />
    </>
  );
}
