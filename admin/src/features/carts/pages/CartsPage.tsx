import { useMemo } from "react";

import { CartStatsGrid } from "@/features/carts/components/CartStatsGrid";
import { CartViewDialog } from "@/features/carts/components/CartViewDialog";
import { useCartStats } from "@/features/carts/hooks/use-cart-stats";
import { useCartsList } from "@/features/carts/hooks/use-carts-list";
import { cartsService } from "@/features/carts/services/carts.service";
import type { AdminCart, CartConversionStatus } from "@/features/carts/types/carts.types";
import { StatusBadge } from "@/shared/components";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
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

function isConversionStatus(value: string | undefined): value is CartConversionStatus {
  return value === "ABANDONED" || value === "CONVERTED";
}

export function CartsPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("carts");
  const { language } = useLocalization();
  const dialog = useCrudDialog<AdminCart>();
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
  } = useCartsList();
  const { data: stats } = useCartStats();

  const { data: cartDetail } = useCrudQuery({
    queryKey: ["carts", "detail", String(dialog.entity?.id ?? "")],
    queryFn: (signal) => cartsService.getById(dialog.entity!.id, signal),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewing = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    return cartDetail ?? dialog.entity;
  }, [cartDetail, dialog.entity, dialog.mode]);

  const activeStatus: CartConversionStatus | "" = isConversionStatus(filters.values.conversionStatus)
    ? filters.values.conversionStatus
    : "";

  const columns = useMemo(
    () => [
      {
        id: "id",
        hideable: false,
        header: "ID",
        cell: (cart: AdminCart) => (
          <button
            type="button"
            className="font-mono text-xs font-bold text-brand hover:underline"
            onClick={() => dialog.openView(cart)}
          >
            #{cart.id}
          </button>
        ),
      },
      {
        id: "customer",
        header: t.customer,
        cell: (cart: AdminCart) =>
          cart.user?.fullName ||
          cart.user?.email ||
          cart.user?.phoneNumber ||
          (cart.guest ? t.cartGuest : "—"),
      },
      {
        id: "status",
        header: t.cartConversionStatus,
        cell: (cart: AdminCart) => (
          <StatusBadge
            label={cart.conversionStatus === "CONVERTED" ? t.cartConverted : t.cartAbandoned}
            variant={cart.conversionStatus === "CONVERTED" ? "success" : "warning"}
          />
        ),
      },
      {
        id: "orders",
        header: t.orders,
        cell: (cart: AdminCart) => cart.ordersCount,
      },
      {
        id: "products",
        header: t.cartProductsInCart,
        cell: (cart: AdminCart) => {
          const titles = (cart.items ?? [])
            .map((item) => item.productTitle)
            .filter((title): title is string => Boolean(title));
          if (titles.length === 0) {
            return cart.purchasedItemsCount || "—";
          }
          const preview = titles.slice(0, 2).join(", ");
          const extra = titles.length > 2 ? ` +${titles.length - 2}` : "";
          return (
            <span className="line-clamp-2 text-sm" title={titles.join(", ")}>
              {preview}
              {extra}
            </span>
          );
        },
      },
      {
        id: "updatedAt",
        header: t.updatedAt,
        cell: (cart: AdminCart) =>
          cart.updatedAt ? formatDateTime(cart.updatedAt, language === "ar" ? "ar" : "en") : "—",
      },
    ],
    [dialog, language, t],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.carts}
      description={t.cartsPageDescription}
    >
      {stats ? (
        <div className="mb-5">
          <CartStatsGrid
            stats={stats}
            activeStatus={activeStatus}
            onSelectStatus={(status) => {
              filters.setFilter("conversionStatus", status || CRUD_FILTER_ALL_VALUE);
            }}
          />
        </div>
      ) : null}

      <CrudListSection>
        <CrudListTable
          tableId="carts"
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.searchCarts,
          }}
          filters={{
            definitions: filterDefinitions,
            values: filters.values,
            onChange: filters.setFilter,
            onReset: filters.resetFilters,
            hasActiveFilters: filters.hasActiveFilters,
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
          emptyDescription={t.cartsEmptyDescription}
          caption={t.carts}
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

      <CartViewDialog
        open={dialog.mode === "view"}
        cart={viewing}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
      />
    </CrudListPage>
  );
}
