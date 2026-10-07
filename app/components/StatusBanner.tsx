import { useState, useEffect } from "react";
import { Callout } from "~/components/Callout";
import { cn } from "~/util/ui/utils";

type StatusBannerProps = {
  variant: "success" | "error";
  message: React.ReactNode;
  className?: string;
  autoDismiss?: number; // Duration in ms before auto-dismiss
};

/**
 * Tells someone how an action they just took went, e.g. "Invite sent" or
 * "Failed to save". A `Callout` that can fade away on its own after
 * `autoDismiss` milliseconds.
 */
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
    <Callout
      tone={variant === "success" ? "positive" : "error"}
      // Errors interrupt screen readers; successes wait their turn
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "transition-opacity duration-300",
        isExiting && "opacity-0",
        className,
      )}
    >
      {message}
    </Callout>
  );
}
