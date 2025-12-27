import { Form } from "react-router";
import { Button } from "~/components/ui/button";

type Props = {
  boardMemberId: number;
  positionTitle: string;
  assignedUserId: string | null;
  assignedUserName: string | null;
  isUnassignment: boolean;
  onCancel: () => void;
};

export function BoardAssignmentForm({
  boardMemberId,
  positionTitle,
  assignedUserId,
  assignedUserName,
  isUnassignment,
  onCancel,
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

      <Form method="post" onSubmit={onCancel} className="mt-4">
        <input type="hidden" name="intent" value="assign" />
        <input type="hidden" name="boardMemberId" value={boardMemberId} />
        <input
          type="hidden"
          name="userId"
          value={isUnassignment ? "" : assignedUserId || ""}
        />
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isUnassignment ? "destructive" : "cta"}
            className="flex-1"
          >
            {isUnassignment ? "Remove" : "Assign"}
          </Button>
        </div>
      </Form>
    </>
  );
}
