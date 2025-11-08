import { cn } from "~/util/ui/utils";

type StatusBannerProps = {
  variant: "success" | "error";
  message: React.ReactNode;
  className?: string;
};

export function StatusBanner({
  variant,
  message,
  className,
}: StatusBannerProps) {
  return (
    <div
      className={cn(
        "rounded-md p-4 text-sm border",
        variant === "success" &&
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        variant === "error" &&
          "bg-destructive/10 text-destructive border-destructive",
        className,
      )}
    >
      {message}
    </div>
  );
}
