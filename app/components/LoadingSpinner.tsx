import { cn } from "~/lib/utils";

type Props = {
  className?: string;
};

export function LoadingSpinner({ className }: Props) {
  return (
    <div
      className={cn(
        "h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-emerald-600",
        className,
      )}
    />
  );
}
