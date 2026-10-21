/**
 * Generic route/query parameter names — not application route paths.
 * Application paths live in `app/router/routes.ts`.
 */
export const ROUTE_QUERY_PARAMS = {
  page: "page",
  pageSize: "pageSize",
  sort: "sort",
  order: "order",
  search: "q",
} as const;

export type RouteQueryParam = (typeof ROUTE_QUERY_PARAMS)[keyof typeof ROUTE_QUERY_PARAMS];
