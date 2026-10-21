import { useMemo } from "react";

import { LoyaltyNumericFilterInput } from "@/features/loyalty-redemptions/components/LoyaltyNumericFilterInput";
import { LoyaltyRedemptionViewDialog } from "@/features/loyalty-redemptions/components/LoyaltyRedemptionViewDialog";
import { useLoyaltyRedemptionsList } from "@/features/loyalty-redemptions/hooks/use-loyalty-redemptions-list";
import { loyaltyRedemptionsService } from "@/features/loyalty-redemptions/services/loyalty-redemptions.service";
import type { LoyaltyRedemption } from "@/features/loyalty-redemptions/types/loyalty-redemptions.types";
import { loyaltyRedemptionStatusVariant } from "@/features/loyalty-redemptions/utils/map-loyalty-redemption-from-api";
import { orderPartyDisplayName } from "@/features/orders/utils/order-customer-display";
import { StatusBadge, UserLabelText } from "@/shared/components";
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
import { useLoyaltyRedemptionStatusOptions } from "@/shared/hooks/use-options";
import { getLoyaltyDisplayName } from "@/shared/lib/loyalty/loyalty-translations.utils";
import { formatDateTime } from "@/shared/lib/datetime.utils";

export function LoyaltyRedemptionsPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("loyalty-redemptions");
  const { language } = useLocalization();
  const dialog = useCrudDialog<LoyaltyRedemption>();
  const { options: statusOptions } = useLoyaltyRedemptionStatusOptions();
  const {
    items: redemptions,
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
    exportCsv,
    isExportingCsv,
  } = useLoyaltyRedemptionsList();

  const { data: redemptionDetail } = useCrudQuery({
    queryKey: ["loyalty-redemptions", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => loyaltyRedemptionsService.getById(dialog.entity!.id),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewingRedemption = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    const listRow =
      redemptions.find((item) => item.id === dialog.entity?.id) ?? dialog.entity;
    if (!redemptionDetail) return listRow;
    return {
      ...redemptionDetail,
      loyaltyReward: redemptionDetail.loyaltyReward ?? listRow.loyaltyReward,
      user: redemptionDetail.user ?? listRow.user,
    };
  }, [dialog.entity, dialog.mode, redemptionDetail, redemptions]);

  const columns = useMemo(
    () => [
      {
        id: "id",
        hideable: false,
        header: "ID",
        cell: (redemption: LoyaltyRedemption) => (
          <button
            type="button"
            className="font-mono text-xs font-bold text-brand hover:underline"
            onClick={() => dialog.openView(redemption)}
          >
            #{redemption.id}
          </button>
        ),
      },
      {
        id: "customer",
        header: t.customer,
        cell: (redemption: LoyaltyRedemption) => {
          const user = redemption.user;
          const label = orderPartyDisplayName(
            {
              fullName: user?.fullName,
              email: user?.email,
              phoneNumber: user?.phoneNumber,
              userId: user?.id ?? redemption.userId,
            },
            redemption.userId ? `#${redemption.userId}` : t.notSet,
          );
          return (
            <UserLabelText value={label} className="text-xs text-foreground" />
          );
        },
      },
      {
        id: "reward",
        header: t.loyaltyRewards,
        cell: (redemption: LoyaltyRedemption) => {
          const reward = redemption.loyaltyReward;
          if (!reward) return <span className="text-xs text-muted-foreground">{t.notSet}</span>;
          const names = getLoyaltyDisplayName(reward.translations, reward.name);
          const label = names.en || names.ar || reward.code;
          return (
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-xs font-medium text-foreground">{label}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{reward.code}</p>
            </div>
          );
        },
      },
      {
        id: "status",
        header: t.loyaltyRedemptionStatus,
        cell: (redemption: LoyaltyRedemption) => {
          const value = redemption.status?.value ?? "";
          const label =
            statusOptions.find((option) => option.value === value)?.label ||
            redemption.status?.label ||
            value ||
            t.notSet;
          return (
            <StatusBadge label={label} variant={loyaltyRedemptionStatusVariant(value)} />
          );
        },
      },
      {
        id: "points",
        header: t.loyaltyRedemptionPoints,
        cell: (redemption: LoyaltyRedemption) => (
          <span className="text-xs font-semibold whitespace-nowrap">{redemption.points}</span>
        ),
      },
      {
        id: "redeemedAt",
        header: t.loyaltyRedemptionRedeemedAt,
        cell: (redemption: LoyaltyRedemption) => (
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {formatDateTime(redemption.redeemedAt, language)}
          </span>
        ),
      },
      {
        id: "expiresAt",
        header: t.loyaltyRedemptionExpiresAt,
        cell: (redemption: LoyaltyRedemption) => (
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {formatDateTime(redemption.expiresAt, language)}
          </span>
        ),
      },
    ],
    [dialog, language, statusOptions, t],
  );

  const idFilterLabels: Record<(typeof idFilterIds)[number], string> = {
    userId: t.customer,
    loyaltyRewardId: t.loyaltyRewards,
  };

  return (
    <CrudListPage {...guidance.pageProps} title={t.loyaltyRedemptions}>
      <CrudListSection>
        <CrudListTable
          tableId="loyalty-redemptions"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.adminSearchPlaceholder,
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
                    id={`loyalty-redemptions-filter-${filterId}`}
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
          data={redemptions}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.loyaltyRedemptions}
          showingLabel={`${t.showing} ${redemptions.length} ${t.of} ${total} ${t.results}`}
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

      <LoyaltyRedemptionViewDialog
        open={dialog.mode === "view"}
        redemption={viewingRedemption}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
      />
    </CrudListPage>
  );
}
