import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { BoardAssignmentForm } from "./BoardAssignmentForm";

interface AssignmentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardMemberId: number;
  positionTitle: string;
  assignedUserId: string | null;
  assignedUserName: string | null;
  isUnassignment: boolean;
}

export function AssignmentConfirmDialog({
  open,
  onOpenChange,
  boardMemberId,
  positionTitle,
  assignedUserId,
  assignedUserName,
  isUnassignment,
}: AssignmentConfirmDialogProps) {
  const title = isUnassignment
    ? "Remove Board Member?"
    : "Assign Board Member?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="site-bg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <BoardAssignmentForm
          boardMemberId={boardMemberId}
          positionTitle={positionTitle}
          assignedUserId={assignedUserId}
          assignedUserName={assignedUserName}
          isUnassignment={isUnassignment}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
