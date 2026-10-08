import { cn } from "~/util/ui/utils";

export type RadioCardOption<T extends string> = {
  value: T;
  label: string;
  /** A line under the label saying what the choice means. */
  description?: string;
};

/**
 * Pick exactly one of a few options, each a full-width card with a short
 * explanation underneath. For when the names alone might not be enough for
 * someone to choose, e.g. which section a document belongs in.
 *
 * Built on native radio buttons, so it posts `name` with a form and the arrow
 * keys move between cards. For longer lists, use a select instead.
 */
export function RadioCards<T extends string>({
  name,
  legend,
  options,
  value,
  onValueChange,
  required = false,
  className,
}: {
  name: string;
  /** The question the cards answer, e.g. "Where should it go?". */
  legend: string;
  options: RadioCardOption<T>[];
  value: T | null;
  onValueChange: (value: T) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-2", className)}>
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-3.5 py-3 transition-colors hover:bg-subtle",
            "has-[input:checked]:border-highlight has-[input:checked]:ring-1 has-[input:checked]:ring-highlight has-[input:checked]:hover:bg-card",
            "has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onValueChange(option.value)}
            required={required}
            className="size-4 shrink-0 accent-emerald-600 outline-none"
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium">{option.label}</span>
            {option.description && (
              <span className="text-[0.8125rem] text-muted-foreground">
                {option.description}
              </span>
            )}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
