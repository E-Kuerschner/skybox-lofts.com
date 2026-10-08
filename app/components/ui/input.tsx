import * as React from "react";

import { cn } from "~/util/ui/utils";

const inputBaseClass =
  "file:text-foreground placeholder:text-muted-foreground selection:bg-emerald-500 selection:text-primary-foreground border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

const inputFocusClass =
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const inputInvalidClass =
  "aria-invalid:ring-destructive/20 aria-invalid:border-destructive";

type InputProps = React.ComponentProps<"input"> & {
  /**
   * Fixed text shown after what's typed, which can't be edited and isn't
   * part of the value, e.g. a file's ".pdf" ending.
   */
  suffix?: React.ReactNode;
};

function Input({ className, type, suffix, ...props }: InputProps) {
  if (suffix) {
    // The border moves to the wrapper so the box, focus ring and invalid
    // state cover the suffix too. `className` still sizes the whole field.
    return (
      <div
        data-slot="input"
        className={cn(
          inputBaseClass,
          "flex items-stretch overflow-hidden p-0",
          "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-ring/50 has-[input:focus-visible]:ring-[3px]",
          "has-[input[aria-invalid=true]]:ring-destructive/20 has-[input[aria-invalid=true]]:border-destructive",
          "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
          className,
        )}
      >
        <input
          type={type}
          className="min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          {...props}
        />
        <span className="flex shrink-0 items-center border-l bg-subtle px-3 text-muted-foreground select-none">
          {suffix}
        </span>
      </div>
    );
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputBaseClass,
        inputFocusClass,
        inputInvalidClass,
        className,
      )}
      {...props}
    />
  );
}

export { Input };
