import { useMemo } from "react";
import { Link } from "react-router";

import { orderViewPath } from "@/app/router/routes";
import { LoyaltyLedgerViewDialog } from "@/features/loyalty-ledger/components/LoyaltyLedgerViewDialog";
import { useLoyaltyLedgerList } from "@/features/loyalty-ledger/hooks/use-loyalty-ledger-list";
import { loyaltyLedgerService } from "@/features/loyalty-ledger/services/loyalty-ledger.service";
import type { LoyaltyLedgerEntry } from "@/features/loyalty-ledger/types/loyalty-ledger.types";
import {
  formatLedgerPoints,
  loyaltyLedgerTypeVariant,
} from "@/features/loyalty-ledger/utils/map-loyalty-ledger-from-api";
import { LoyaltyNumericFilterInput } from "@/features/loyalty-redemptions/components/LoyaltyNumericFilterInput";
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
import { useLoyaltyLedgerTypeOptions } from "@/shared/hooks/use-options";
import { getLoyaltyDisplayName } from "@/shared/lib/loyalty/loyalty-translations.utils";
import { formatDateTime } from "@/shared/lib/datetime.utils";

export function LoyaltyLedgerPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("loyalty-ledger");
  const { language } = useLocalization();
  const dialog = useCrudDialog<LoyaltyLedgerEntry>();
  const { options: typeOptions } = useLoyaltyLedgerTypeOptions();
  const {
    items: entries,
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
  } = useLoyaltyLedgerList();

  const { data: entryDetail } = useCrudQuery({
    queryKey: ["loyalty-ledger", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => loyaltyLedgerService.getById(dialog.entity!.id),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewingEntry = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    const listRow = entries.find((item) => item.id === dialog.entity?.id) ?? dialog.entity;
    if (!entryDetail) return listRow;
    return {
      ...entryDetail,
      user: entryDetail.user ?? listRow.user,
      loyaltyEvent: entryDetail.loyaltyEvent ?? listRow.loyaltyEvent,
      loyaltyReward: entryDetail.loyaltyReward ?? listRow.loyaltyReward,
      order: entryDetail.order ?? listRow.order,
    };
  }, [dialog.entity, dialog.mode, entries, entryDetail]);

  const columns = useMemo(
    () => [
      {
        id: "id",
        hideable: false,
        header: "ID",
        cell: (entry: LoyaltyLedgerEntry) => (
          <button
            type="button"
            className="font-mono text-xs font-bold text-brand hover:underline"
            onClick={() => dialog.openView(entry)}
          >
            #{entry.id}
          </button>
        ),
      },
      {
        id: "type",
        header: t.loyaltyLedgerType,
        cell: (entry: LoyaltyLedgerEntry) => {
          const value = entry.type?.value ?? "";
          const label =
            typeOptions.find((option) => option.value === value)?.label ||
            entry.type?.label ||
            value ||
            t.notSet;
          return <StatusBadge label={label} variant={loyaltyLedgerTypeVariant(value)} />;
        },
      },
      {
        id: "customer",
        header: t.customer,
        cell: (entry: LoyaltyLedgerEntry) => {
          const user = entry.user;
          const label = orderPartyDisplayName(
            {
              fullName: user?.fullName,
              email: user?.email,
              phoneNumber: user?.phoneNumber,
              userId: user?.id ?? entry.userId,
            },
            entry.userId ? `#${entry.userId}` : t.notSet,
          );
          return (
            <UserLabelText value={label} className="text-xs text-foreground" />
          );
        },
      },
      {
        id: "points",
        header: t.loyaltyLedgerPoints,
        cell: (entry: LoyaltyLedgerEntry) => (
          <span
            className={`text-xs font-semibold whitespace-nowrap ${
              entry.points >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
            }`}
          >
            {formatLedgerPoints(entry.points)}
          </span>
        ),
      },
      {
        id: "balanceAfter",
        header: t.loyaltyLedgerBalanceAfter,
        cell: (entry: LoyaltyLedgerEntry) => (
          <span className="text-xs font-semibold whitespace-nowrap">{entry.balanceAfter}</span>
        ),
      },
      {
        id: "relations",
        header: t.viewDetails,
        cell: (entry: LoyaltyLedgerEntry) => {
          const event = entry.loyaltyEvent;
          const reward = entry.loyaltyReward;
          const order = entry.order;
          const eventLabel = event
            ? getLoyaltyDisplayName(event.translations, event.name).en ||
              getLoyaltyDisplayName(event.translations, event.name).ar ||
              event.code
            : null;
          const rewardLabel = reward
            ? getLoyaltyDisplayName(reward.translations, reward.name).en ||
              getLoyaltyDisplayName(reward.translations, reward.name).ar ||
              reward.code
            : null;

          if (!eventLabel && !rewardLabel && !order) {
            return <span className="text-xs text-muted-foreground">{t.notSet}</span>;
          }

          return (
            <div className="min-w-0 space-y-0.5 text-xs text-muted-foreground">
              {eventLabel ? <p className="truncate">{eventLabel}</p> : null}
              {rewardLabel ? <p className="truncate">{rewardLabel}</p> : null}
              {order?.id ? (
                <Link
                  to={orderViewPath(order.orderRefNumber ?? String(order.id))}
                  className="font-mono text-brand hover:underline"
                  onClick={(eventClick) => eventClick.stopPropagation()}
                >
                  {order.orderRefNumber || `#${order.id}`}
                </Link>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "createdAt",
        header: t.date,
        cell: (entry: LoyaltyLedgerEntry) => (
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {formatDateTime(entry.createdAt, language)}
          </span>
        ),
      },
    ],
    [dialog, language, t, typeOptions],
  );

  const idFilterLabels: Record<(typeof idFilterIds)[number], string> = {
    userId: t.customer,
    loyaltyEventId: t.loyaltyEvents,
    loyaltyRewardId: t.loyaltyRewards,
    orderId: t.orderNum,
  };

  return (
    <CrudListPage {...guidance.pageProps} title={t.loyaltyLedger}>
      <CrudListSection>
        <CrudListTable
          tableId="loyalty-ledger"
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
                    id={`loyalty-ledger-filter-${filterId}`}
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
          data={entries}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.loyaltyLedger}
          showingLabel={`${t.showing} ${entries.length} ${t.of} ${total} ${t.results}`}
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

      <LoyaltyLedgerViewDialog
        open={dialog.mode === "view"}
        entry={viewingEntry}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
      />
    </CrudListPage>
  );
}
