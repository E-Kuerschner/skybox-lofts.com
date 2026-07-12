import type * as React from "react";
import { cn } from "~/util/ui/utils";

/**
 * The standard white content panel that wraps each resident page's content.
 */
export function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-xl border px-4 pt-4 pb-8 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
