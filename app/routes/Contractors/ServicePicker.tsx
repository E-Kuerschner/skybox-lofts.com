import { useMemo, useState } from "react";
import { Chip } from "~/components/Chip";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import type { ContractorService } from "./types";

/** How many picked services show before the rest fold into "+N more". */
const VISIBLE_PICKS = 4;

/**
 * Picks the services a business offers from the building's service list.
 *
 * Type to search the list, pick from the dropdown, and the picks collect as
 * chips underneath (folding into "+N more" past a handful, so a busy business
 * doesn't push the rest of the form off screen). Only services already on the
 * list can be picked, which keeps the list tidy for everyone. Each pick is
 * posted as a `serviceIds` field.
 */
export function ServicePicker({
  services,
  selectedIds,
  onChange,
}: {
  /** The whole service list. */
  services: ContractorService[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showAllPicks, setShowAllPicks] = useState(false);

  const byId = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services],
  );
  const picked = selectedIds
    .map((id) => byId.get(id))
    .filter((service) => service !== undefined);
  const available = services
    .filter((service) => !selectedIds.includes(service.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const visiblePicks = showAllPicks ? picked : picked.slice(0, VISIBLE_PICKS);
  const hiddenCount = picked.length - visiblePicks.length;

  const add = (id: number) => {
    onChange([...selectedIds, id]);
    setQuery("");
  };
  const remove = (id: number) =>
    onChange(selectedIds.filter((selectedId) => selectedId !== id));

  return (
    <div className="flex flex-col gap-2">
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="serviceIds" value={id} />
      ))}

      <Command
        loop
        className="overflow-visible rounded-none bg-transparent **:data-[slot=command-input-wrapper]:h-10 **:data-[slot=command-input-wrapper]:rounded-lg **:data-[slot=command-input-wrapper]:border **:data-[slot=command-input-wrapper]:bg-card **:data-[slot=command-input-wrapper]:shadow-xs **:data-[slot=command-input-wrapper]:focus-within:border-ring **:data-[slot=command-input-wrapper]:focus-within:ring-[3px] **:data-[slot=command-input-wrapper]:focus-within:ring-ring/50"
        onKeyDown={(event) => {
          // Escape closes the dropdown first, rather than the whole dialog.
          if (event.key === "Escape" && isOpen) {
            event.stopPropagation();
            setIsOpen(false);
          }
        }}
      >
        <div className="relative">
          <CommandInput
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            placeholder={
              picked.length > 0 ? "Add a service" : "Add a service, like painting"
            }
            className="text-base md:text-sm"
          />

          {isOpen && (
            <CommandList
              // Keep focus in the search box while picking, so the dropdown
              // stays open for picking several in a row.
              onMouseDown={(event) => event.preventDefault()}
              className="absolute inset-x-0 top-full z-50 mt-1.5 max-h-64 rounded-xl border bg-popover p-1 shadow-lg"
            >
              <CommandEmpty>
                <div className="flex flex-col items-start gap-2 px-2 py-1 text-left">
                  <span className="font-semibold">
                    No service called “{query}”
                  </span>
                  <span className="text-muted-foreground">
                    Try a different word, or browse the whole list.
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery("")}
                  >
                    Show all services
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {available.map((service) => (
                  <CommandItem
                    key={service.id}
                    value={service.name}
                    onSelect={() => add(service.id)}
                    className="min-h-10 cursor-pointer rounded-lg px-2.5 data-[selected=true]:bg-emerald-50 data-[selected=true]:text-emerald-800"
                  >
                    {service.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          )}
        </div>
      </Command>

      {picked.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Pick one or more from the list. Picked services show up below.
        </p>
      ) : (
        <>
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {visiblePicks.map((service) => (
              <li key={service.id}>
                <Chip
                  size="md"
                  className="h-8"
                  onRemove={() => remove(service.id)}
                  removeLabel={`Remove ${service.name}`}
                >
                  {service.name}
                </Chip>
              </li>
            ))}
            {hiddenCount > 0 && (
              <li>
                <button
                  type="button"
                  onClick={() => setShowAllPicks(true)}
                  className="h-8 cursor-pointer rounded-full border border-dashed px-3 text-sm font-medium text-foreground/80 hover:border-ring hover:text-foreground"
                >
                  +{hiddenCount} more
                </button>
              </li>
            )}
          </ul>
          <p className="text-sm text-muted-foreground">
            {picked.length} picked ·{" "}
            <button
              type="button"
              onClick={() => onChange([])}
              className="cursor-pointer font-medium text-emerald-700 hover:underline"
            >
              Clear all
            </button>
          </p>
        </>
      )}
    </div>
  );
}
