import { useCallback, useEffect, useState } from "react";
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

/**
 * A page-level place to announce the outcome of a change.
 *
 * The CRUD dialogs close themselves on success, so the confirmation has to land
 * somewhere that outlives them. Errors stay inside the dialog, next to the form
 * that caused them; only successes bubble up here.
 *
 * It floats above the page rather than sitting in the flow: a banner that takes
 * up space shoves the whole list down the moment it appears, so the row you
 * just edited jumps out from under your cursor.
 */
export function useStatusBanner() {
  const [message, setMessage] = useState<string | null>(null);
  // A new key remounts the banner so its auto-dismiss timer starts over
  const [renderKey, setRenderKey] = useState(0);

  const showSuccess = useCallback((text: string) => {
    setMessage(text);
    setRenderKey((key) => key + 1);
  }, []);

  const banner = message ? (
    // The wrapper ignores clicks so the floating banner never swallows a tap
    // meant for the page underneath it.
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <StatusBanner
        key={renderKey}
        variant="success"
        message={message}
        autoDismiss={4000}
        className="pointer-events-auto max-w-md shadow-lg animate-in fade-in slide-in-from-top-2"
      />
    </div>
  ) : null;

  return { banner, showSuccess };
}
