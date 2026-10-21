import { Eye } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { customerCrmPath } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { CrmStatsGrid } from "@/features/customers/components/CrmStatsGrid";
import { CustomerTagBadges } from "@/features/customers/components/CustomerTagBadges";
import { useCrmStats } from "@/features/customers/hooks/use-crm-stats";
import { useCustomersList } from "@/features/customers/hooks/use-customers-list";
import type { CrmCustomer, CrmSegment } from "@/features/customers/types/customers.types";
import { isCrmSegment, visibleTags } from "@/features/customers/utils/crm-segments";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { PhoneNumberText, StatusBadge, UserAvatar } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CRUD_FILTER_ALL_VALUE,
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  type CrudRowAction,
} from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import { formatDateTime } from "@/shared/lib/datetime.utils";

export function CustomersPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const guidance = useCrudPageGuidance("customers");
  useCrudPermissions(PERMISSIONS.MANAGE_CUSTOMER);
  const {
    items: customers,
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
    setListFilter,
    resetListFilters,
    filterDefinitions,
    sort,
    setSort,
    sortDefinitions,
  } = useCustomersList(10);
  const { data: stats } = useCrmStats();

  useEffect(() => {
    const rawId = searchParams.get("id")?.trim();
    if (!rawId) return;
    const id = Number(rawId);
    if (!Number.isFinite(id) || id <= 0) return;
    navigate(customerCrmPath(id), { replace: true });
  }, [navigate, searchParams]);

  const openCustomer = useCallback(
    (customer: CrmCustomer) => {
      navigate(customerCrmPath(customer.id));
    },
    [navigate],
  );

  const rowActions = useMemo<CrudRowAction<CrmCustomer>[]>(
    () => [
      {
        id: "view",
        label: t.viewAction,
        icon: Eye,
        onSelect: openCustomer,
      },
    ],
    [openCustomer, t.viewAction],
  );

  const columns = useMemo(
    () => [
      {
        id: "name",
        hideable: false,
        header: t.customer,
        cell: (customer: CrmCustomer) => (
          <CrudEntityNameCell
            placeholder={<UserAvatar name={customer.fullName} size="sm" />}
            size="sm"
            onClick={() => openCustomer(customer)}
          >
            <span className="font-semibold text-foreground">{customer.fullName}</span>
            {customer.phoneNumber ? (
              <PhoneNumberText
                value={customer.phoneNumber}
                className="block text-xs text-muted-foreground"
              />
            ) : null}
          </CrudEntityNameCell>
        ),
      },
      {
        id: "tags",
        header: t.crmTags,
        cell: (customer: CrmCustomer) => <CustomerTagBadges tags={visibleTags(customer)} />,
      },
      {
        id: "orders",
        header: t.orders,
        cell: (customer: CrmCustomer) => customer.ordersCount,
      },
      {
        id: "spent",
        header: t.spent,
        cell: (customer: CrmCustomer) => (
          <span className="font-semibold text-brand">{formatKwd(customer.spent)}</span>
        ),
      },
      {
        id: "points",
        header: t.points,
        cell: (customer: CrmCustomer) => customer.loyalty.pointsBalance.toLocaleString("en-US"),
      },
      {
        id: "lastOrder",
        header: t.lastOrder,
        cell: (customer: CrmCustomer) => (
          <span className="text-xs text-muted-foreground">
            {customer.lastOrderAt ? formatDateTime(customer.lastOrderAt, language) : "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: t.status,
        cell: (customer: CrmCustomer) => (
          <StatusBadge
            label={customer.active ? t.active : t.inactive}
            variant={customer.active ? "success" : "neutral"}
          />
        ),
      },
    ],
    [language, openCustomer, t],
  );

  const activeSegment: CrmSegment | "" = isCrmSegment(filters.values.segment)
    ? filters.values.segment
    : "";

  return (
    <CrudListPage {...guidance.pageProps} title={t.crm} description={t.crmPageDescription}>
      {stats ? (
        <div className="mb-5" data-guidance="crm-stats">
          <CrmStatsGrid
            stats={stats}
            activeSegment={activeSegment}
            onSelectSegment={(segment) => {
              setListFilter("segment", segment || CRUD_FILTER_ALL_VALUE);
            }}
          />
        </div>
      ) : null}

      <CrudListSection>
        <CrudListTable
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          tableId="crm-customers"
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.crmSearchPlaceholder,
          }}
          filters={{
            definitions: filterDefinitions,
            values: filters.values,
            onChange: (id, value) => {
              setListFilter(id, value);
            },
            onReset: resetListFilters,
            hasActiveFilters: filters.hasActiveFilters,
          }}
          sort={{ definitions: sortDefinitions, value: sort, onChange: setSort }}
          columns={columns}
          data={customers}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          rowActions={(customer) => (
            <CrudTableActions entity={customer} actions={rowActions} ariaLabel={t.actions} />
          )}
          actionsHeader={t.actions}
          caption={t.customers}
          showingLabel={`${t.showing} ${customers.length} ${t.of} ${total} ${t.results}`}
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
    </CrudListPage>
  );
}
