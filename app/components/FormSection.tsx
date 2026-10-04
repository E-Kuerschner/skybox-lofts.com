import { cn } from "~/util/ui/utils";

/** The small all-caps heading that names a group of fields in a form. */
export const formSectionTitleClass =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

/** The asterisk that marks a field or section as required. */
export function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden>
      {" "}
      *
    </span>
  );
}

/**
 * A labelled group of fields in a form, with an optional hint underneath.
 *
 * Long forms read as a handful of named sections rather than one long column
 * of inputs, which is easier for someone filling one in on a phone.
 */
export function FormSection({
  title,
  required = false,
  hint,
  children,
  className,
}: {
  title: string;
  required?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <h3 className={formSectionTitleClass}>
        {title}
        {required && <RequiredMark />}
      </h3>
      {children}
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </section>
  );
}
