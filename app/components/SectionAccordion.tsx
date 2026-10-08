import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "~/util/ui/utils";

type SectionAccordionProps = Omit<
  React.ComponentProps<typeof AccordionPrimitive.Root>,
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
    <AccordionPrimitive.Root
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
    <AccordionPrimitive.Item
      value={value}
      className={cn("border-t first:border-t-0", className)}
    >
      <AccordionPrimitive.Header asChild>
        <h3>
          <AccordionPrimitive.Trigger className="group flex min-h-11 w-full cursor-pointer items-center gap-2 bg-subtle px-5 text-left text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset data-[state=open]:border-b">
            <ChevronDownIcon className="size-3.5 shrink-0 transition-transform duration-150 ease-out group-data-[state=closed]:-rotate-90" />
            <span className="text-xs font-medium tracking-[0.04em] uppercase">
              {title}
            </span>
            {count !== undefined && (
              <span className="text-xs">· {count}</span>
            )}
          </AccordionPrimitive.Trigger>
        </h3>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        {children}
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
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
