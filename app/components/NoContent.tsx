import { GhostIcon } from "lucide-react";
import { cn } from "~/util/ui/utils";

export function NoContent({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex justify-center items-center gap-3 my-12 text-muted-foreground",
        className,
      )}
    >
      <GhostIcon />
      <p>{message}</p>
    </div>
  );
}
