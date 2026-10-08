import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { cn } from "~/util/ui/utils";

type SectionAccordionProps = Omit<
  React.ComponentProps<typeof Accordion>,
  "type" | "value" | "defaultValue" | "onValueChange"
> & {
  /** Which sections are open, for when the page needs to open them itself. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

/**
 * A white card holding a list split into named sections, each of which can be
 * folded away, e.g. documents grouped by type.
 *
 * Any number of sections can be open at once. Section headers are quiet,
 * small all-caps bands with a count, so the rows inside stay the focus. Put
 * `SectionAccordionItem`s inside; their content sits flush against the card's
 * edges, so lay rows out with their own padding.
 */
export function SectionAccordion({ className, ...props }: SectionAccordionProps) {
  return (
    <Accordion
      type="multiple"
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

export function SectionAccordionItem({
  value,
  title,
  count,
  children,
  className,
}: {
  value: string;
  title: string;
  /** How many things the section holds, shown after the title. */
  count?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AccordionItem value={value} className={className}>
      <AccordionTrigger
        className={cn(
          // A full-width band rather than the default underlined row
          "min-h-11 cursor-pointer items-center gap-2 rounded-none bg-subtle px-5 py-0 text-muted-foreground hover:text-foreground hover:no-underline focus-visible:ring-inset data-[state=open]:border-b",
          // The chevron leads, and points right when the section is folded
          "flex-row-reverse justify-end [&>svg]:size-3.5 [&>svg]:translate-y-0 [&>svg]:text-current [&>svg]:duration-150 [&[data-state=closed]>svg]:-rotate-90 [&[data-state=open]>svg]:rotate-0",
        )}
      >
        <span className="flex items-center gap-2">
          <span className="text-xs font-medium tracking-[0.04em] uppercase">
            {title}
          </span>
          {count !== undefined && (
            <span className="text-xs font-normal">· {count}</span>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-0">{children}</AccordionContent>
    </AccordionItem>
  );
}

/** A full-width button at the end of a section, e.g. "Show all 9". */
export function SectionAccordionMoreButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "h-11 w-full cursor-pointer border-t text-sm font-medium text-emerald-700 outline-none hover:bg-subtle focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
        className,
      )}
      {...props}
    />
  );
}
