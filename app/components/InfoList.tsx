import type { LucideIcon } from "lucide-react";
import { cn } from "~/util/ui/utils";

const toneClasses = {
  neutral: "bg-muted text-muted-foreground",
  positive: "bg-positive text-positive-foreground",
  warning: "bg-warning text-warning-foreground",
};

/**
 * A boxed list of facts about one thing, one per row: a contractor's phone
 * and email, a resident's status and unit. Fill it with `InfoRow`s.
 */
export function InfoList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("divide-y overflow-hidden rounded-xl border", className)}
      {...props}
    />
  );
}

type InfoRowProps = {
  /** Small heading above the value, e.g. "Email". */
  label: string;
  value: React.ReactNode;
  /** Makes the value a link, e.g. a `mailto:`. */
  href?: string;
  /** Open `href` in a new tab, for websites and maps. */
  newTab?: boolean;
  /** At the end of the row, e.g. a copy button. */
  trailing?: React.ReactNode;
} & (
  | {
      /** Shown in a square tile at the start of the row. */
      icon: LucideIcon;
      /** The tile's color, for rows that are a status. */
      tone?: keyof typeof toneClasses;
      leading?: never;
    }
  | {
      /** Your own start-of-row tile instead of `icon`, e.g. a `ContactButton`. */
      leading: React.ReactNode;
      icon?: never;
      tone?: never;
    }
);

/** One fact in an `InfoList`: a tile, a label with its value, and optional extras. */
export function InfoRow({
  label,
  value,
  href,
  newTab = false,
  trailing,
  icon: Icon,
  tone = "neutral",
  leading,
}: InfoRowProps) {
  const text = (
    <>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </>
  );

  return (
    <li className="flex items-center gap-3 py-2 pr-2 pl-3">
      {Icon ? (
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            toneClasses[tone],
          )}
        >
          <Icon className="size-4" />
        </span>
      ) : (
        leading
      )}
      {href ? (
        <a
          href={href}
          {...(newTab && { target: "_blank", rel: "noreferrer" })}
          className="flex min-w-0 grow flex-col"
        >
          {text}
        </a>
      ) : (
        <div className="flex min-w-0 grow flex-col">{text}</div>
      )}
      {trailing}
    </li>
  );
}
