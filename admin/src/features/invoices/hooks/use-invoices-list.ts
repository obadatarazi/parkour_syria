import { useCallback, useMemo } from "react";

import { invoicesService } from "@/features/invoices/services/invoices.service";
import type { InvoiceListParams } from "@/features/invoices/types/invoices.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapStringFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  useInvoicePaymentProviderOptions,
  useInvoiceStatusOptions,
} from "@/shared/hooks/use-options";

const INVOICE_FILTER_IDS = ["status", "paymentProvider"] as const;

export function useInvoicesList(limit = 12) {
  const t = useTranslation();
  const { options: statusOptions } = useInvoiceStatusOptions();
  const { options: paymentProviderOptions } = useInvoicePaymentProviderOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "status",
        label: t.invoiceStatus,
        allLabel: t.filterAll,
        primary: true,
        options: statusOptions,
      },
      {
        id: "paymentProvider",
        label: t.payment,
        allLabel: t.filterAll,
        options: paymentProviderOptions,
      },
    ],
    [paymentProviderOptions, statusOptions, t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "invoice_number:desc", label: t.sortInvoiceNumberDesc },
          { value: "invoice_number:asc", label: t.sortInvoiceNumberAsc },
          { value: "total_price:desc", label: t.sortTotalDesc },
          { value: "total_price:asc", label: t.sortTotalAsc },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({
        status: mapStringFilterValue(values.status),
        paymentProvider: mapStringFilterValue(values.paymentProvider),
      }) satisfies Pick<InvoiceListParams, "status" | "paymentProvider">,
    [],
  );

  const fetchFn = useCallback(
    (params: InvoiceListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      invoicesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "invoices",
    exportPath: "/admin/invoices/export",
    fetchFn,
    limit,
    filterIds: [...INVOICE_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
