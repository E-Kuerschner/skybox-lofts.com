import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { Form } from "react-router";
import NewBoardMemberForm from "./NewBoardMemberForm";
import { StatusBanner } from "~/components/StatusBanner";

interface MobileBoardMemberDrawerProps {
  name: string;
  role: string;
  isFormValid: boolean;
  onNameChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  actionData?: { success?: boolean; error?: string };
}

export default function MobileBoardMemberDrawer({
  name,
  role,
  isFormValid,
  onNameChange,
  onRoleChange,
  actionData,
}: MobileBoardMemberDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      setOpen(false);
    }
  }, [actionData]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Board Member
      </Button>
      <SheetContent className="site-bg" side="bottom">
        <SheetHeader>
          <SheetTitle>Add Board Member</SheetTitle>
          <SheetDescription>
            Enter the name and position of the new board member
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {actionData?.error && (
            <StatusBanner variant="error" message={actionData.error} />
          )}
          <Form method="post" onSubmit={() => {}}>
            <input type="hidden" name="intent" value="create" />
            <NewBoardMemberForm
              name={name}
              role={role}
              isFormValid={isFormValid}
              onNameChange={onNameChange}
              onRoleChange={onRoleChange}
              submitLabel="Add Board Member"
              vertical={true}
            />
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
