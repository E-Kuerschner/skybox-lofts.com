import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { ActionButton } from "~/components/ActionButton";
import {
  OverlayBody,
  OverlayFooter,
  ResponsiveOverlay,
} from "~/components/ResponsiveOverlay";
import { isActionResult } from "~/util/crud/actionResult";
import { ActionStatusBanner } from "./ActionStatusBanner";
import { CRUD_INTENT_FIELD, CRUD_RECORD_ID_FIELD } from "./CrudFormDialog";

type ConfirmActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** The action's intent, e.g. "delete". */
  intent: string;
  recordId: string | number;
  action?: string;
  confirmLabel: string;
  pendingLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onSuccess?: (message: string) => void;
  /** What is about to happen, in plain language, naming the thing. */
  children: React.ReactNode;
};

/**
 * The sibling of `CrudFormDialog` for actions that need a yes/no rather than a
 * form — deleting, mostly.
 *
 * It exists so no feature reaches for `window.confirm()`, which is browser
 * chrome the site has no control over and which people learn to dismiss without
 * reading. Buttons are labeled with what they do ("Remove contractor" /
 * "Keep it"), never OK/Cancel.
 */
export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  intent,
  recordId,
  action,
  confirmLabel,
  pendingLabel = "Working...",
  cancelLabel = "Cancel",
  destructive = false,
  onSuccess,
  children,
}: ConfirmActionDialogProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const handledResult = useRef<unknown>(null);

  useEffect(() => {
    if (!open) setHasSubmitted(false);
  }, [open]);

  useEffect(() => {
    if (fetcher.state === "submitting") setHasSubmitted(true);
  }, [fetcher.state]);

  useEffect(() => {
    if (fetcher.state !== "idle" || !hasSubmitted) return;
    if (handledResult.current === fetcher.data) return;
    if (!isActionResult(fetcher.data) || !fetcher.data.success) return;

    handledResult.current = fetcher.data;
    onSuccess?.(fetcher.data.message);
    onOpenChange(false);
  }, [fetcher.state, fetcher.data, hasSubmitted, onSuccess, onOpenChange]);

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) onOpenChange(next);
      }}
      title={title}
      description={description}
      bare
    >
      <fetcher.Form
        method="post"
        action={action}
        className="flex min-h-0 flex-1 flex-col"
      >
        <input type="hidden" name={CRUD_INTENT_FIELD} value={intent} />
        <input
          type="hidden"
          name={CRUD_RECORD_ID_FIELD}
          value={String(recordId)}
        />

        <OverlayBody className="flex flex-col gap-4">
          {hasSubmitted && (
            <ActionStatusBanner result={fetcher.data} className="shrink-0" />
          )}

          <div className="text-sm text-muted-foreground">{children}</div>
        </OverlayBody>

        <OverlayFooter>
          <ActionButton
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </ActionButton>
          <ActionButton
            type="submit"
            variant={destructive ? "destructive" : "cta"}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? pendingLabel : confirmLabel}
          </ActionButton>
        </OverlayFooter>
      </fetcher.Form>
    </ResponsiveOverlay>
  );
}
