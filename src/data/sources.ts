/**
 * When externally sourced content was last checked. Shown next to that content, and flagged as
 * possibly out of date after STALE_DAYS. Update the date when you re-check a source.
 */
export const sourcesChecked = {
  career: '2026-10-10',       // NZ job-market examples and role links
  degree: '2026-10-10',       // UoA MDataSci 2026 plan and 2027 catalogue
  dsa: '2026-10-10',          // A2Z sheet structure, takeUforward URLs, NeetCode lists
  roadmaps: '2026-10-09',     // the 13 roadmap PDFs behind the Topic atlas
  weekly: '2026-10-10',       // weekly Learn / Read / Practise links
} as const;
export type SourceId = keyof typeof sourcesChecked;
export const STALE_DAYS = 180;
