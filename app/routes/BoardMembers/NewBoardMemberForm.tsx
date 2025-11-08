import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { cn } from "~/util/ui/utils";

interface NewBoardMemberFormProps {
  name: string;
  role: string;
  isFormValid: boolean;
  onNameChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  submitLabel: string;
  vertical?: boolean;
}

export default function NewBoardMemberForm({
  name,
  role,
  isFormValid,
  onNameChange,
  onRoleChange,
  submitLabel,
  vertical = false,
}: NewBoardMemberFormProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        vertical ? "flex-col gap-5" : "flex-row gap-4",
      )}
    >
      <input type="hidden" name="intent" value="create" />
      <div className={vertical ? "w-full space-y-2" : "flex-1"}>
        {vertical && <Label htmlFor="board-member-name">Name</Label>}
        <Input
          id="board-member-name"
          name="name"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          className="bg-background md:shadow-lg"
        />
      </div>

      <div className={vertical ? "w-full space-y-2" : "flex-1"}>
        {vertical && <Label htmlFor="board-member-role">Position</Label>}
        <Input
          id="board-member-role"
          name="role"
          type="text"
          placeholder="Position, e.g. Board President"
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          required
          className="bg-background md:shadow-lg"
        />
      </div>

      <div className={vertical ? "w-full" : "w-32"}>
        <Button
          type="submit"
          variant="cta"
          className="w-full"
          disabled={!isFormValid}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
