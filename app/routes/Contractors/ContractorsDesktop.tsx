import { TabBar, TabBarTab } from "~/components/TabBar";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import { cn } from "~/util/ui/utils";
import { DirectoryBrowserDesktop } from "./DirectoryBrowserDesktop";
import { DIRECTORY_COPY } from "./directoryCopy";
import type { DirectoryTab, DirectoryViewProps } from "./directory";

/** The contractors page on wider screens. */
export function ContractorsDesktop({
  tab,
  onTabChange,
  unit,
  building,
  canAdd,
  onAdd,
  className,
  ...handlers
}: DirectoryViewProps & { className?: string }) {
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => onTabChange(value as DirectoryTab)}
      className={cn("gap-6", className)}
    >
      <TabBar>
        <TabBarTab value="unit" label="In-unit work & services" count={unit.total} />
        <TabBarTab
          value="building"
          label="Building service providers"
          count={building.total}
        />
      </TabBar>

      <TabsContent value="unit" className="flex flex-col gap-6">
        <DirectoryBrowserDesktop
          section={unit}
          copy={DIRECTORY_COPY.unit}
          showPhotos
          canAdd={canAdd.unit}
          onAdd={() => onAdd(false)}
          {...handlers}
        />
      </TabsContent>

      <TabsContent value="building" className="flex flex-col gap-6">
        <DirectoryBrowserDesktop
          section={building}
          copy={DIRECTORY_COPY.building}
          showPhotos={false}
          canAdd={canAdd.building}
          onAdd={() => onAdd(true)}
          {...handlers}
        />
      </TabsContent>
    </Tabs>
  );
}
