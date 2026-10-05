import type { Route } from "./+types/index";

/** One resident as the management page's loader returns them. */
export type Resident = Route.ComponentProps["loaderData"]["users"][number];
