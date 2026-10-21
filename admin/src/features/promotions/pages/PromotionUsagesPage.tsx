import { useMemo } from "react";

import { LoyaltyNumericFilterInput } from "@/features/loyalty-redemptions/components/LoyaltyNumericFilterInput";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { PromotionUsageViewDialog } from "@/features/promotions/components/PromotionUsageViewDialog";
import { usePromotionUsagesList } from "@/features/promotions/hooks/use-promotion-usages-list";
import { promotionUsagesService } from "@/features/promotions/services/promotion-usages.service";
import type { PromotionUsage } from "@/features/promotions/types/promotions.types";
import {
  CrudListPage,
  CrudListSection,
  CrudListTable,
  useCrudDialog,
  useCrudQuery,
} from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import { formatDateTime } from "@/shared/lib/datetime.utils";

export function PromotionUsagesPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("promotion-usages");
  const { language } = useLocalization();
  const dialog = useCrudDialog<PromotionUsage>();
  const {
    items,
    search,
    setSearch,
    resetSearch,
    page,
    setPage,
    setPageSize,
    total,
    pageSize,
    isLoading,
    isError,
    error,
    refetch,
    filters,
    filterDefinitions,
    sort,
    setSort,
    sortDefinitions,
    idFilterIds,
  } = usePromotionUsagesList();

  const { data: usageDetail } = useCrudQuery({
    queryKey: ["promotion-usages", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => promotionUsagesService.getById(dialog.entity!.id),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewing = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    return usageDetail ?? dialog.entity;
  }, [dialog.entity, dialog.mode, usageDetail]);

  const columns = useMemo(
    () => [
      {
        id: "id",
        hideable: false,
        header: "ID",
        cell: (usage: PromotionUsage) => (
          <button
            type="button"
            className="font-mono text-xs font-bold text-brand hover:underline"
            onClick={() => dialog.openView(usage)}
          >
            #{usage.id}
          </button>
        ),
      },
      {
        id: "code",
        header: t.promotionCode,
        cell: (usage: PromotionUsage) => (
          <span className="font-mono text-xs font-semibold">{usage.code}</span>
        ),
      },
      {
        id: "promotion",
        header: t.promotions,
        cell: (usage: PromotionUsage) => usage.promotionName || usage.promotion?.name || "—",
      },
      {
        id: "customer",
        header: t.customer,
        cell: (usage: PromotionUsage) =>
          usage.user?.name ||
          usage.user?.email ||
          usage.cartUuid ||
          (usage.userId ? `#${usage.userId}` : "—"),
      },
      {
        id: "order",
        header: t.orders,
        cell: (usage: PromotionUsage) =>
          usage.order?.orderRefNumber || (usage.orderId ? `#${usage.orderId}` : "—"),
      },
      {
        id: "givenAway",
        header: t.promotionGivenAway,
        cell: (usage: PromotionUsage) => formatKwd(usage.pricePromotions),
      },
      {
        id: "usedAt",
        header: t.promotionUsedAt,
        cell: (usage: PromotionUsage) =>
          usage.usedAt ? formatDateTime(usage.usedAt, language === "ar" ? "ar" : "en") : "—",
      },
    ],
    [dialog, language, t],
  );

  const idFilterLabels: Record<(typeof idFilterIds)[number], string> = {
    promotionId: t.promotions,
    userId: t.customer,
    orderId: t.orders,
  };

  return (
    <CrudListPage {...guidance.pageProps} title={t.promotionUsages}>
      <CrudListSection>
        <CrudListTable
          tableId="promotion-usages"
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.searchPromotionUsages,
          }}
          filters={{
            definitions: filterDefinitions,
            values: filters.values,
            onChange: filters.setFilter,
            onReset: filters.resetFilters,
            hasActiveFilters: filters.hasActiveFilters,
            endAdornment: (
              <>
                {idFilterIds.map((filterId) => (
                  <LoyaltyNumericFilterInput
                    key={filterId}
                    id={`promotion-usages-filter-${filterId}`}
                    label={idFilterLabels[filterId]}
                    value={filters.values[filterId] ?? ""}
                    onChange={(value) => filters.setFilter(filterId, value)}
                  />
                ))}
              </>
            ),
          }}
          sort={{ definitions: sortDefinitions, value: sort, onChange: setSort }}
          columns={columns}
          data={items}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.promotionUsagesEmptyDescription}
          caption={t.promotionUsages}
          showingLabel={`${t.showing} ${items.length} ${t.of} ${total} ${t.results}`}
          pagination={{
            page,
            pageSize,
            totalItems: total,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
            pageSizeLabel: t.perPage,
            previousLabel: t.previous,
            nextLabel: t.nextPage,
          }}
        />
      </CrudListSection>

      <PromotionUsageViewDialog
        open={dialog.mode === "view"}
        usage={viewing}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
      />
    </CrudListPage>
  );
}
