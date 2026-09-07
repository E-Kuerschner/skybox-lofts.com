import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { ResponsiveOverlay } from "~/components/ResponsiveOverlay";
import { isActionResult } from "~/util/crud/actionResult";
import { cn } from "~/util/ui/utils";
import { ActionStatusBanner } from "./ActionStatusBanner";

export type CrudMode = "create" | "edit";

/**
 * The form contract every CRUD action in the app can rely on:
 * `intent` says what to do, `recordId` says to what.
 */
export const CRUD_INTENT_FIELD = "intent";
export const CRUD_RECORD_ID_FIELD = "recordId";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type CrudFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Decides the intent posted, plus the default title and button copy. */
  mode: CrudMode;
  /** Singular, lowercase noun for the thing being edited, e.g. "contractor". */
  entityName: string;
  /** Primary key of the record. Required in "edit" mode, ignored in "create". */
  recordId?: string | number;
  /** Where to post. Defaults to the current route's action. */
  action?: string;
  title?: string;
  description?: string;
  /** Set when the form contains a file input. */
  hasFileUploads?: boolean;
  submitLabel?: string;
  /** Blocks submitting while the form is known to be incomplete. */
  submitDisabled?: boolean;
  /** Called with the success message just before the dialog closes itself. */
  onSuccess?: (message: string) => void;
  children: React.ReactNode;
};

/**
 * The shared modal for creating and editing things.
 *
 * Every create/edit in the app happens in one of these, so it owns the parts
 * that were being rewritten per feature:
 *
 * - the responsive shell (dialog on desktop, sheet on mobile) and its copy;
 * - the `intent` / `recordId` hidden fields;
 * - its own fetcher, so a page doesn't have to thread one in and then work out
 *   which overlay a given result belongs to;
 * - errors shown inside the form that caused them, successes handed to the page
 *   via `onSuccess` as the dialog closes;
 * - a result from a previous save never greeting you when you reopen it;
 * - disabling the whole form while saving, via a `fieldset` — so individual
 *   fields never need a `disabled` prop of their own;
 * - resetting uncontrolled fields when it opens on a different record.
 *
 * What is left to the caller is the part that is actually per-feature: the
 * fields themselves.
 */
export function CrudFormDialog({
  open,
  onOpenChange,
  mode,
  entityName,
  recordId,
  action,
  title,
  description,
  hasFileUploads = false,
  submitLabel,
  submitDisabled = false,
  onSuccess,
  children,
}: CrudFormDialogProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  // Only show a result that came from a submission made since this opened,
  // otherwise reopening the dialog greets you with the last save's error.
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

  const isEdit = mode === "edit";
  const defaultTitle = isEdit
    ? `Edit ${entityName}`
    : `Add a ${entityName}`;
  const defaultSubmitLabel = isEdit
    ? "Save changes"
    : `Add ${entityName}`;

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={(next) => {
        // Closing mid-save would leave the person with no idea what happened
        if (!isSubmitting) onOpenChange(next);
      }}
      title={title ?? capitalize(defaultTitle)}
      description={description}
    >
      <fetcher.Form
        // Remount on a different record so uncontrolled defaultValues reset
        key={`${mode}-${recordId ?? "new"}`}
        method="post"
        action={action}
        encType={hasFileUploads ? "multipart/form-data" : undefined}
        className="max-h-[70vh] space-y-4 overflow-y-auto pt-2"
      >
        <input type="hidden" name={CRUD_INTENT_FIELD} value={isEdit ? "update" : "create"} />
        {isEdit && recordId !== undefined && (
          <input
            type="hidden"
            name={CRUD_RECORD_ID_FIELD}
            value={String(recordId)}
          />
        )}

        {hasSubmitted && <ActionStatusBanner result={fetcher.data} />}

        {/* Disabling the fieldset disables every control inside it, so fields
            don't each need their own `disabled` prop. */}
        <fieldset
          disabled={isSubmitting}
          className={cn("min-w-0 space-y-4 border-0 p-0", isSubmitting && "opacity-70")}
        >
          {children}
        </fieldset>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="cta"
            className="flex-1"
            disabled={isSubmitting || submitDisabled}
          >
            {isSubmitting
              ? "Saving..."
              : (submitLabel ?? capitalize(defaultSubmitLabel))}
          </Button>
        </div>
      </fetcher.Form>
    </ResponsiveOverlay>
  );
}
