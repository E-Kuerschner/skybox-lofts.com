import { Badge } from "~/components/ui/badge";
import { TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/util/ui/utils";

/**
 * Full-width page tabs over a rule, the active one underlined in the app's
 * active green. Built on shadcn `Tabs`, so use it inside `<Tabs>` with
 * `<TabsContent>` panels as usual.
 *
 * For the same choice on a phone, where a row of tabs is too wide, use
 * `<SegmentedToggle>` driving the same `<Tabs value>`.
 */
export function TabBar({
  className,
  ...props
}: Omit<React.ComponentProps<typeof TabsList>, "variant">) {
  return (
    <TabsList
      variant="line"
      className={cn(
        // `h-auto!`: the base list sets its height through a selector that
        // ties with a plain class, and would otherwise win - leaving the tabs
        // (and their active line) hanging below the rule.
        "h-auto! w-full justify-start border-b p-0",
        className,
      )}
      {...props}
    />
  );
}

/** One tab, with an optional count of what it holds. */
export function TabBarTab({
  label,
  count,
  className,
  ...props
}: Omit<React.ComponentProps<typeof TabsTrigger>, "children"> & {
  label: string;
  count?: number;
}) {
  return (
    <TabsTrigger
      className={cn(
        // The active line sits right on the rule rather than below it.
        "group h-12 flex-none cursor-pointer px-3 text-base after:-bottom-px! after:bg-highlight",
        className,
      )}
      {...props}
    >
      {label}
      {count !== undefined && (
        <Badge
          variant="secondary"
          className="min-w-5 px-1.5 text-muted-foreground group-data-[state=active]:bg-highlight-surface group-data-[state=active]:text-highlight-foreground"
        >
          {count}
        </Badge>
      )}
    </TabsTrigger>
  );
}
