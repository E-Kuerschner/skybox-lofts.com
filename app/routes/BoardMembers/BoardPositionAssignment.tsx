import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface VerifiedResident {
  id: string;
  name: string | null;
  email: string;
}

interface BoardPositionAssignmentProps {
  boardMemberId: number;
  currentUserId: string | null;
  currentUserName: string | null;
  verifiedResidents: VerifiedResident[];
  onAssignmentChange: (boardMemberId: number, userId: string | null, userName: string | null) => void;
}

export function BoardPositionAssignment({
  boardMemberId,
  currentUserId,
  currentUserName,
  verifiedResidents,
  onAssignmentChange,
}: BoardPositionAssignmentProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentUserId || "vacant"}
        onValueChange={(value) => {
          const userId = value === "vacant" ? null : value;
          const userName = value === "vacant"
            ? null
            : verifiedResidents.find((r) => r.id === value)?.name || null;
          onAssignmentChange(boardMemberId, userId, userName);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select resident" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="vacant">
            <span className="text-muted-foreground italic">Make Vacant</span>
          </SelectItem>
          {verifiedResidents.map((resident) => (
            <SelectItem key={resident.id} value={resident.id}>
              {resident.name || resident.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
