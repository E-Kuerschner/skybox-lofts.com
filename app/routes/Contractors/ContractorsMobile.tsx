import { PlusIcon } from "lucide-react";
import { AdminOnly } from "~/components/AdminOnly";
import { Button } from "~/components/ui/button";
import { SegmentedToggle } from "~/components/SegmentedToggle";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import { cn } from "~/util/ui/utils";
import { DirectoryBrowserMobile } from "./DirectoryBrowserMobile";
import { DIRECTORY_COPY } from "./directoryCopy";
import type { DirectoryTab, DirectoryViewProps } from "./directory";

/** The contractors page on phones. */
export function ContractorsMobile({
  tab,
  onTabChange,
  unit,
  building,
  onAdd,
  className,
  ...handlers
}: DirectoryViewProps & { className?: string }) {
  const copy = DIRECTORY_COPY[tab];

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => onTabChange(value as DirectoryTab)}
      className={cn("gap-4", className)}
    >
      <div className="flex items-center gap-2">
        <SegmentedToggle
          ariaLabel="Which list to show"
          stretch
          value={tab}
          onChange={onTabChange}
          options={[
            { value: "unit", label: "In-unit", count: unit.total },
            { value: "building", label: "Building", count: building.total },
          ]}
          className="min-w-0 grow"
        />
        <AdminOnly>
          <Button
            variant="secondary"
            size="icon"
            className="size-10 md:size-10 rounded-full"
            onClick={() => onAdd(tab === "building")}
            aria-label={copy.addLabel}
          >
            <PlusIcon />
          </Button>
        </AdminOnly>
      </div>

      <TabsContent value="unit" className="flex flex-col gap-4">
        <DirectoryBrowserMobile
          section={unit}
          emptyMessage={DIRECTORY_COPY.unit.emptyMessage}
          {...handlers}
        />
      </TabsContent>

      <TabsContent value="building" className="flex flex-col gap-4">
        <DirectoryBrowserMobile
          section={building}
          intro={DIRECTORY_COPY.building.description}
          emptyMessage={DIRECTORY_COPY.building.emptyMessage}
          {...handlers}
        />
      </TabsContent>
    </Tabs>
  );
}
