import { StatusIndicator } from "~/components/StatusIndicator";
import type { Resident } from "./types";

/** Whether a resident has signed in yet: "Verified" or "Invite pending". */
export function AccessStatus({
  resident,
  className,
}: {
  resident: Resident;
  className?: string;
}) {
  return resident.emailVerified ? (
    <StatusIndicator tone="positive" className={className}>
      Verified
    </StatusIndicator>
  ) : (
    <StatusIndicator tone="warning" className={className}>
      Invite pending
    </StatusIndicator>
  );
}
