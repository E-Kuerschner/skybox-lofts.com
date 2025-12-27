import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { BoardAssignmentForm } from "./BoardAssignmentForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardMemberId: number;
  positionTitle: string;
  assignedUserId: string | null;
  assignedUserName: string | null;
  isUnassignment: boolean;
};

export function AssignmentConfirmDrawer({
  open,
  onOpenChange,
  boardMemberId,
  positionTitle,
  assignedUserId,
  assignedUserName,
  isUnassignment,
}: Props) {
  const title = isUnassignment
    ? "Remove Board Member?"
    : "Assign Board Member?";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="site-bg md:hidden"
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="sr-only">{title}</SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <BoardAssignmentForm
            boardMemberId={boardMemberId}
            positionTitle={positionTitle}
            assignedUserId={assignedUserId}
            assignedUserName={assignedUserName}
            isUnassignment={isUnassignment}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
