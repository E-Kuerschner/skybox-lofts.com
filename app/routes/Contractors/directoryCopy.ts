import type { DirectoryBrowserCopy } from "./DirectoryBrowserDesktop";
import type { DirectoryTab } from "./directory";

/** The words each tab of the directory uses, shared by both layouts. */
export const DIRECTORY_COPY: Record<DirectoryTab, DirectoryBrowserCopy> = {
  unit: {
    title: "What do you need done?",
    description:
      "Pick a job to see who residents recommend. Contact the business yourself. Who you hire is up to you.",
    addLabel: "Add contractor",
    emptyMessage: "No contractors have been added yet. Check back soon.",
  },
  building: {
    title: "Building service providers",
    description:
      "These businesses look after the building itself. The board handles these contacts, so you shouldn't need to contact them yourself.",
    addLabel: "Add provider",
    emptyMessage: "No building service providers have been added yet.",
  },
};
