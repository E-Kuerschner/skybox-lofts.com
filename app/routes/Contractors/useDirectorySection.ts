import { useMemo, useState } from "react";
import {
  ALL_JOBS,
  groupByJob,
  jobOptions,
  type DirectorySection,
} from "./directory";
import type { ContractorListing } from "./types";

/**
 * The job pick and search for one tab, and the grouped list they produce.
 *
 * Each tab keeps its own, so looking for a painter never quietly narrows the
 * building vendors on the other tab.
 */
export function useDirectorySection(
  listings: ContractorListing[],
): DirectorySection {
  const [pickedJob, setPickedJob] = useState(ALL_JOBS);
  const [query, setQuery] = useState("");

  const jobs = useMemo(() => jobOptions(listings), [listings]);
  const groups = useMemo(
    () => groupByJob(listings, pickedJob, query),
    [listings, pickedJob, query],
  );

  return {
    total: listings.length,
    jobs,
    pickedJob,
    onPickJob: setPickedJob,
    query,
    onQueryChange: setQuery,
    groups,
  };
}
