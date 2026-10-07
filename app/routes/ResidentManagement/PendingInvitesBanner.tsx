import { MailIcon } from "lucide-react";
import { Callout } from "~/components/Callout";
import { Button } from "~/components/ui/button";
import type { Resident } from "./types";

/**
 * A heads-up about residents who were invited but haven't signed in yet.
 *
 * It stays one short strip however many people are waiting: it names the
 * first two and counts the rest, and "Show them" narrows the list below to
 * just those people. Shows nothing when everyone has accepted.
 */
export function PendingInvitesBanner({
  pending,
  isShowingPending,
  onToggleShowPending,
}: {
  pending: Resident[];
  isShowingPending: boolean;
  onToggleShowPending: () => void;
}) {
  if (pending.length === 0) return null;

  const count = pending.length;
  const named = pending
    .slice(0, 2)
    .map((resident) => resident.name || resident.email)
    .join(", ");
  const summary = count > 2 ? `${named} and ${count - 2} more` : named;

  return (
    <Callout
      tone="warning"
      icon={MailIcon}
      title={
        count === 1
          ? "1 person hasn't accepted their invite yet"
          : `${count} people haven't accepted their invite yet`
      }
      actions={
        <Button
          variant="outline"
          onClick={onToggleShowPending}
          className="h-10 md:h-9 border-warning-border bg-card text-warning-foreground hover:bg-card hover:text-warning-foreground hover:border-warning-foreground/40"
        >
          {isShowingPending ? "Show everyone" : "Show them"}
        </Button>
      }
      className="rounded-xl py-3.5 md:pl-5"
    >
      <p className="truncate">{summary}</p>
    </Callout>
  );
}
