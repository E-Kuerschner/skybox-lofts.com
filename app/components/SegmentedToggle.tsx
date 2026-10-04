import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "~/util/ui/utils";

export type SegmentedToggleOption<T extends string> = {
  value: T;
  label: string;
  /** Shown as a small counter next to the label, e.g. how many items it holds. */
  count?: number;
};

/**
 * A pill-shaped single-select toggle, e.g. switching between two ways of
 * sorting or viewing a list. The selected option always uses the same
 * brighter green as other "currently active" states in the app (distinct
 * from the orange/green button colors used for actions), and the highlight
 * slides between options instead of just swapping classes.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  stretch = false,
  className,
}: {
  options: readonly SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  /** Fill the available width, splitting it evenly between the options. */
  stretch?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef(new Map<T, HTMLButtonElement>());
  const [highlight, setHighlight] = useState<{
    left: number;
    width: number;
  } | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const button = buttonRefs.current.get(value);
    if (!container || !button) return;

    const measure = () =>
      setHighlight({ left: button.offsetLeft, width: button.offsetWidth });

    measure();

    // Re-measure on container resize (e.g. viewport width changes) so the
    // highlight doesn't drift out of place under the label it belongs to.
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex shrink-0 rounded-full border bg-card p-0.5 text-sm",
        stretch && "w-full",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {highlight && (
        <div
          aria-hidden
          className="absolute inset-y-0.5 left-0 rounded-full border border-ring bg-emerald-50 transition-[transform,width] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none"
          style={{
            transform: `translateX(${highlight.left}px)`,
            width: highlight.width,
          }}
        />
      )}

      {options.map((option) => (
        <button
          key={option.value}
          ref={(el) => {
            if (el) buttonRefs.current.set(option.value, el);
            else buttonRefs.current.delete(option.value);
          }}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "relative z-10 cursor-pointer rounded-full px-3 py-1.5 transition-colors",
            stretch && "flex-1",
            value === option.value
              ? "text-emerald-800"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span
              className={cn(
                "ml-1.5 text-xs",
                value === option.value
                  ? "text-emerald-700"
                  : "text-muted-foreground",
              )}
            >
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
