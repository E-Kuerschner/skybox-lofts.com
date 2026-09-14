import { cn } from "~/util/ui/utils";

export type CheckboxGroupOption = {
  /** Posted as the checkbox's form field name, e.g. "isBuildingService". */
  name: string;
  label: string;
  /** One line saying what picking this actually does. */
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/**
 * A bordered set of related yes/no choices, each with a line explaining what it
 * means.
 *
 * The description is the whole point. A bare checkbox labeled "Building service
 * provider" asks the reader to already know what that implies; this pattern
 * says it outright, which matters because the people using the admin side of
 * this app aren't technical and shouldn't have to guess what a toggle will do.
 *
 * Each option is its own form field rather than one field with several values,
 * so the options don't have to be related in the database - they just have to
 * be a decision someone makes in one place.
 *
 * For a single either/or choice use `<SegmentedToggle />` instead; for picking
 * many items out of a long list (services, say) a plain checkbox list is
 * lighter than this.
 */
export function CheckboxGroup({
  legend,
  options,
  className,
}: {
  legend: string;
  options: readonly CheckboxGroupOption[];
  className?: string;
}) {
  return (
    <fieldset
      className={cn("space-y-2 rounded-lg border bg-white p-3", className)}
    >
      <legend className="ps-1 pe-0 text-sm font-medium">{legend}</legend>

      {options.map((option) => (
        <label key={option.name} className="flex cursor-pointer gap-3">
          <input
            type="checkbox"
            name={option.name}
            checked={option.checked}
            onChange={(event) => option.onChange(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-emerald-600"
          />
          <span className="text-sm">
            <span className="font-medium">{option.label}</span>
            {option.description && (
              <span className="block text-xs text-muted-foreground">
                {option.description}
              </span>
            )}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
