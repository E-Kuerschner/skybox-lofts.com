import { useEffect, useState } from "react";
import { StatusBanner } from "~/components/StatusBanner";
import { isActionResult } from "~/util/crud/actionResult";

/**
 * Renders the outcome of any action that returns an `ActionResult`.
 *
 * Success messages disappear on their own; errors stay until the next attempt,
 * because an error is something the person still needs to act on.
 */
export function ActionStatusBanner({
  result,
  className,
}: {
  result: unknown;
  className?: string;
}) {
  // Remount the banner on each new result so the auto-dismiss timer restarts
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    if (result) setRenderKey((key) => key + 1);
  }, [result]);

  if (!isActionResult(result)) return null;

  return result.success ? (
    <StatusBanner
      key={renderKey}
      variant="success"
      message={result.message}
      autoDismiss={4000}
      className={className}
    />
  ) : (
    <StatusBanner
      key={renderKey}
      variant="error"
      message={result.error}
      className={className}
    />
  );
}
