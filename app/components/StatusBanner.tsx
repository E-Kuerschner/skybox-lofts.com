import { useState, useEffect } from "react";
import { cn } from "~/util/ui/utils";

type StatusBannerProps = {
  variant: "success" | "error";
  message: React.ReactNode;
  className?: string;
  autoDismiss?: number; // Duration in ms before auto-dismiss
};

export function StatusBanner({
  variant,
  message,
  className,
  autoDismiss,
}: StatusBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!autoDismiss) return;

    // Start fade-out animation before unmounting
    const fadeOutTimer = setTimeout(() => {
      setIsExiting(true);
    }, autoDismiss);

    // Actually unmount after animation completes
    const unmountTimer = setTimeout(() => {
      setIsVisible(false);
    }, autoDismiss + 300); // 300ms for fade-out animation

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(unmountTimer);
    };
  }, [autoDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "rounded-md p-4 text-sm border transition-opacity duration-300",
        variant === "success" && "bg-success/10 text-success border-success/40",
        variant === "error" &&
          "bg-destructive/10 text-destructive border-destructive/40",
        isExiting && "opacity-0",
        className,
      )}
    >
      {message}
    </div>
  );
}
