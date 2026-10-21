import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { customersService } from "@/features/customers/services/customers.service";
import type {
  CrmCustomer,
  CrmCustomerListParams,
  CrmSegment,
  CrmTag,
} from "@/features/customers/types/customers.types";
import {
  applyCrmListSearchParams,
  crmListFiltersFromSearch,
  readCrmListFiltersFromWindow,
} from "@/features/customers/utils/crm-segments";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  useServerPaginatedList,
} from "@/shared/crud";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const FILTER_IDS: string[] = ["segment", "tag", "status", "carePlan"];

function filtersFromLocation(routerSearch: string) {
  const fromRouter = crmListFiltersFromSearch(routerSearch);
  if (fromRouter.segment || fromRouter.tag) return fromRouter;
  return readCrmListFiltersFromWindow();
}

export function useCustomersList(limit = 10) {
  const t = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [initialFilterValues] = useState(() => filtersFromLocation(location.search));

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "segment",
        label: t.crmSegment,
        allLabel: t.crmFilterAllSegments,
        primary: true,
        options: [
          { value: "new_buyers", label: t.crmSegmentNewBuyers },
          { value: "repeat_buyers", label: t.crmSegmentRepeatBuyers },
          { value: "care_plan", label: t.crmSegmentCarePlan },
          { value: "inactive", label: t.crmSegmentInactive },
          { value: "big_spenders", label: t.crmSegmentBigSpenders },
        ],
      },
      {
        id: "tag",
        label: t.crmTags,
        allLabel: t.crmFilterAllTags,
        primary: true,
        options: [
          { value: "vip", label: t.crmTagVip },
          { value: "care_plan", label: t.crmTagCarePlan },
          { value: "prescription", label: t.crmTagPrescription },
          { value: "high_value", label: t.crmTagHighValue },
          { value: "inactive", label: t.crmTagInactive },
        ],
      },
      {
        id: "status",
        label: t.status,
        allLabel: t.crmFilterAllStatuses,
        options: [
          { value: "active", label: t.active },
          { value: "inactive", label: t.inactive },
        ],
      },
      {
        id: "carePlan",
        label: t.crmCarePlan,
        allLabel: t.crmFilterAnyPlan,
        options: [
          { value: "yes", label: t.crmHasCarePlan },
          { value: "no", label: t.crmNoCarePlan },
        ],
      },
    ],
    [t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "spent:desc", label: t.crmSortSpentDesc },
          { value: "spent:asc", label: t.crmSortSpentAsc },
          { value: "ordersCount:desc", label: t.crmSortOrdersDesc },
          { value: "joinedAt:desc", label: t.crmSortJoinedDesc },
          { value: "fullName:asc", label: t.crmSortNameAsc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback((values: Record<string, string>) => {
    const pick = (key: string) =>
      values[key] && values[key] !== CRUD_FILTER_ALL_VALUE ? values[key] : undefined;

    return {
      segment: pick("segment") as CrmSegment | undefined,
      tag: pick("tag") as CrmTag | undefined,
      status: pick("status") as CrmCustomerListParams["status"],
      carePlan: pick("carePlan") as CrmCustomerListParams["carePlan"],
    } satisfies Pick<CrmCustomerListParams, "segment" | "tag" | "status" | "carePlan">;
  }, []);

  const fetchFn = useCallback(
    (params: CrmCustomerListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      customersService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList<CrmCustomer>({
    queryKeyPrefix: "crm-customers",
    fetchFn,
    limit,
    filterIds: FILTER_IDS,
    mapFiltersToParams,
    initialFilterValues,
    defaultSort: "spent:desc",
  });

  const urlFilters = useMemo(
    () => filtersFromLocation(location.search),
    [location.search],
  );

  const setFilter = list.filters.setFilter;
  const resetFilters = list.filters.resetFilters;
  const currentSegment = list.filters.values.segment;
  const currentTag = list.filters.values.tag;

  useEffect(() => {
    const nextSegment = urlFilters.segment ?? CRUD_FILTER_ALL_VALUE;
    const nextTag = urlFilters.tag ?? CRUD_FILTER_ALL_VALUE;
    if (currentSegment !== nextSegment) setFilter("segment", nextSegment);
    if (currentTag !== nextTag) setFilter("tag", nextTag);
  }, [currentSegment, currentTag, setFilter, urlFilters.segment, urlFilters.tag]);

  const writeListSearch = useCallback(
    (patch: { segment?: string; tag?: string }) => {
      const search = applyCrmListSearchParams(location.search, patch);
      const current = location.search.startsWith("?")
        ? location.search.slice(1)
        : location.search;
      if (search === current) return;
      navigate(
        { pathname: location.pathname, search: search ? `?${search}` : "" },
        { replace: true },
      );
    },
    [location.pathname, location.search, navigate],
  );

  const setListFilter = useCallback(
    (id: string, value: string) => {
      setFilter(id, value);
      if (id === "segment" || id === "tag") {
        writeListSearch({ [id]: value });
      }
    },
    [setFilter, writeListSearch],
  );

  const resetListFilters = useCallback(() => {
    resetFilters();
    writeListSearch({ segment: "", tag: "" });
  }, [resetFilters, writeListSearch]);

  return {
    ...list,
    setListFilter,
    resetListFilters,
    filterDefinitions,
    sortDefinitions,
  };
}
