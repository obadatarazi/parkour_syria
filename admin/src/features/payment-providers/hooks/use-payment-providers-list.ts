import { useCallback, useMemo } from "react";

import { paymentProvidersService } from "@/features/payment-providers/services/payment-providers.service";
import type {
  PaymentProviderListParams,
  PaymentProviderTypeValue,
} from "@/features/payment-providers/types/payment-providers.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  isActiveFilterValue,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useInvoicePaymentProviderOptions } from "@/shared/hooks/use-options";

const PAYMENT_PROVIDER_FILTER_IDS = ["publish", "standard", "type"] as const;

export function usePaymentProvidersList(limit = 12) {
  const t = useTranslation();
  const { options: typeOptions } = useInvoicePaymentProviderOptions();

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
      {
        id: "type",
        label: t.paymentProviderType,
        allLabel: t.filterAll,
        primary: true,
        options: typeOptions,
      },
      {
        id: "standard",
        label: t.standardPaymentProvider,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.standardPaymentProvider },
          { value: "false", label: t.notStandardPaymentProvider },
        ],
      },
    ],
    [t, typeOptions],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "title:asc", label: t.sortTitleAsc },
          { value: "title:desc", label: t.sortTitleDesc },
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
        standard: mapBooleanFilterValue(values.standard),
        type: isActiveFilterValue(values.type)
          ? (values.type as PaymentProviderTypeValue)
          : undefined,
      }) satisfies Pick<PaymentProviderListParams, "publish" | "standard" | "type">,
    [],
  );

  const fetchFn = useCallback(
    (params: PaymentProviderListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      paymentProvidersService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "payment-providers",
    exportPath: "/admin/payment-providers/export",
    fetchFn,
    limit,
    filterIds: [...PAYMENT_PROVIDER_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
