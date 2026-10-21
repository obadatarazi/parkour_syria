import { useCallback, useMemo } from "react";

import { countriesService } from "@/features/countries/services/countries.service";
import type { Country, CountryListParams } from "@/features/countries/types/countries.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useCrudQuery,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { formatBilingualLabel, getBilingualTitle } from "@/shared/lib/translation-display.utils";

const COUNTRY_FILTER_IDS = ["publish"] as const;

export function useCountriesList(limit = 10) {
  const t = useTranslation();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "publish",
        label: t.status,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
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
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({
        publish: mapBooleanFilterValue(values.publish),
      }) satisfies Pick<CountryListParams, "publish">,
    [],
  );

  const fetchFn = useCallback(
    (params: CountryListParams & { page: number; limit: number }, signal?: AbortSignal) => countriesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "countries",
    exportPath: "/admin/countries/export",
    fetchFn,
    limit,
    filterIds: [...COUNTRY_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}

export function useCountryOptions() {
  const queryFn = useCallback(
    (signal?: AbortSignal) => countriesService.list({ limit: 200 }, signal),
    [],
  );

  const query = useCrudQuery({
    queryKey: ["countries", "options"],
    queryFn,
    staleTime: 30 * 60 * 1000,
  });

  const options = useMemo(
    () =>
      (query.data?.data ?? [])
        .map((country: Country) => ({
          value: String(country.id),
          label: formatBilingualLabel(getBilingualTitle(country.translations, country.title)),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [query.data?.data],
  );

  return {
    options,
    isLoading: query.isLoading,
  };
}
