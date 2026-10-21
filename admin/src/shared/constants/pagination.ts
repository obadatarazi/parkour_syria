/** Default list pagination values used across the admin application. */
export const DEFAULT_PAGE_SIZE = 10;

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;

export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

/** Debounce delay for search inputs (milliseconds). */
export const SEARCH_DEBOUNCE_MS = 300;

/** Sentinel value for "all" filter options in list views. */
export const FILTER_ALL_VALUE = "all";
