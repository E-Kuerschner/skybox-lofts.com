import { XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/util/ui/utils";

// On phones it rises from the bottom edge as a sheet and stops short of the
// top; anything longer scrolls inside it.
const mobileSheet =
  "max-md:inset-x-0 max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:max-h-[90dvh] max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-b-none max-md:border-x-0 max-md:border-b-0 max-md:data-[state=open]:slide-in-from-bottom max-md:data-[state=closed]:slide-out-to-bottom";

type ResponsiveOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  /** Extra classes for the content box, e.g. `md:max-w-[35rem]` to widen it. */
  contentClassName?: string;
  /**
   * Leave out the header bar, for content that draws its own top (a cover
   * photo, say). The title is still announced to screen readers; add an
   * `OverlayCloseButton` somewhere so it can be closed.
   */
  hideHeader?: boolean;
  /** Above the title, e.g. a "Back to …" link. */
  headerStart?: React.ReactNode;
  /** Beside the close button, e.g. an Edit button. */
  headerActions?: React.ReactNode;
  /** Pinned under the content, e.g. the dialog's buttons. */
  footer?: React.ReactNode;
  /**
   * Render `children` straight into the dialog instead of a padded, scrolling
   * body - for content (like a form) that lays out its own `OverlayBody` and
   * `OverlayFooter`.
   */
  bare?: boolean;
};

/**
 * The app's dialog: a centered card on wider screens and a bottom sheet on
 * phones. Header and footer stay put while the body
 * scrolls, so the buttons are always in reach.
 */
export function ResponsiveOverlay({
  open,
  onOpenChange,
  title,
  description,
  children,
  showCloseButton = true,
  contentClassName,
  hideHeader = false,
  headerStart,
  headerActions,
  footer,
  bare = false,
}: ResponsiveOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex flex-col gap-0 overflow-hidden bg-card p-0 md:max-h-[85vh] md:max-w-lg",
          mobileSheet,
          contentClassName,
        )}
      >
        {hideHeader ? (
          <>
            <DialogTitle className="sr-only">{title}</DialogTitle>
            {description && (
              <DialogDescription className="sr-only">
                {description}
              </DialogDescription>
            )}
          </>
        ) : (
          <div className="flex shrink-0 items-start justify-between gap-3 border-b px-5 pt-4 pb-3.5 md:px-6 md:pt-5 md:pb-4">
            <div className="flex min-w-0 flex-col gap-1">
              {headerStart}
              <DialogTitle className="md:text-[1.375rem]">{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerActions}
              {showCloseButton && <OverlayCloseButton />}
            </div>
          </div>
        )}

        {bare ? children : <OverlayBody>{children}</OverlayBody>}
        {footer && <OverlayFooter>{footer}</OverlayFooter>}
      </DialogContent>
    </Dialog>
  );
}

/** The overlay's scrolling middle. */
export function OverlayBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6",
        className,
      )}
      {...props}
    />
  );
}

/** The overlay's pinned bottom row, for its buttons. */
export function OverlayFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 border-t bg-card px-5 pt-3.5 pb-[max(env(safe-area-inset-bottom),0.875rem)] md:px-6",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The overlay's round close button. `floating` gives it a solid background
 * and shadow so it stays visible over a photo.
 */
export function OverlayCloseButton({
  floating = false,
  className,
}: {
  floating?: boolean;
  className?: string;
}) {
  return (
    <DialogClose asChild>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Close"
        className={cn(
          "size-9 md:size-9 rounded-full bg-muted text-foreground/70 hover:text-foreground",
          floating && "bg-card shadow-sm hover:bg-card",
          className,
        )}
      >
        <XIcon />
      </Button>
    </DialogClose>
  );
}
