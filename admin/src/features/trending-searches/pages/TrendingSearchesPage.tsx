import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { TrendingSearchFormDrawer } from "@/features/trending-searches/components/TrendingSearchFormDrawer";
import { TrendingSearchViewDialog } from "@/features/trending-searches/components/TrendingSearchViewDialog";
import {
  type TrendingSearchQuickToggleField,
  useTrendingSearchMutations,
} from "@/features/trending-searches/hooks/use-trending-search-mutations";
import { useTrendingSearchesList } from "@/features/trending-searches/hooks/use-trending-searches-list";
import { trendingSearchesService } from "@/features/trending-searches/services/trending-searches.service";
import type { TrendingSearch } from "@/features/trending-searches/types/trending-searches.types";
import { getTrendingSearchLabel } from "@/features/trending-searches/types/trending-searches.types";
import { AppBadge, AppButton, BilingualText } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudBulkDeleteDialog,
  CrudDeleteDialog,
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  CrudTableBooleanToggle,
  useCrudBulkDelete,
  useCrudDialog,
  useCrudQuery,
  useCrudQuickToggle,
  useCrudRowActions,
  useCrudTableBulkActions,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

export function TrendingSearchesPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("trending-searches");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    PERMISSIONS.MANAGE_TRENDING_SEARCH,
  );
  const dialog = useCrudDialog<TrendingSearch>();
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
    patchItems,
    filters,
    filterDefinitions,
    sort,
    setSort,
    sortDefinitions,
    selection,
    exportCsv,
    isExportingCsv,
  } = useTrendingSearchesList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => trendingSearchesService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useTrendingSearchMutations({
    onSuccess: async () => {
      await refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<TrendingSearch>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as TrendingSearchQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  const { data: itemDetail } = useCrudQuery({
    queryKey: ["trending-searches", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => trendingSearchesService.getById(dialog.entity!.id),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewingItem = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    return (
      itemDetail ??
      items.find((item) => item.id === dialog.entity?.id) ??
      dialog.entity
    );
  }, [dialog.entity, dialog.mode, itemDetail, items]);

  const rowActions = useCrudRowActions<TrendingSearch>({
    dialog,
    canUpdate,
    canDelete,
    t,
    includeView: false,
  });

  const columns = useMemo(
    () => [
      {
        id: "name",
        hideable: false,
        header: t.trendingSearchLabel,
        cell: (item: TrendingSearch) => {
          const title = getBilingualTitle(item.translations, item.label);
          return (
            <CrudEntityNameCell
              placeholder="🔍"
              size="sm"
              onClick={() => dialog.openView(item)}
              actions={
                <CrudTableActions entity={item} actions={rowActions} ariaLabel={t.actions} />
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                {title.en ? (
                  <AppBadge label={title.en} variant="brand" className="font-medium" />
                ) : null}
                {title.ar ? (
                  <span dir="rtl">
                    <AppBadge label={title.ar} variant="neutral" className="font-medium" />
                  </span>
                ) : null}
                {!title.en && !title.ar ? <BilingualText values={title} /> : null}
              </div>
            </CrudEntityNameCell>
          );
        },
      },
      {
        id: "targetType",
        header: t.trendingSearchTargetType,
        cell: (item: TrendingSearch) =>
          item.targetType?.label || item.targetType?.value || t.notSet,
      },
      {
        id: "sortOrder",
        header: t.trendingSearchSortOrder,
        cell: (item: TrendingSearch) => item.sortOrder,
      },
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (item: TrendingSearch) => (
          <CrudTableBooleanToggle
            entity={item}
            field="publish"
            checked={item.publish ?? false}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(item.id, "publish")}
            ariaLabel={`${t.status}: ${getTrendingSearchLabel(item)}`}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, rowActions, t],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.trendingSearches}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addTrendingSearch}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <CrudListTable
          tableId="trending-searches"
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
            placeholder: t.searchTrendingSearches,
          }}
          filters={{
            definitions: filterDefinitions,
            values: filters.values,
            onChange: filters.setFilter,
            onReset: filters.resetFilters,
            hasActiveFilters: filters.hasActiveFilters,
          }}
          sort={{ definitions: sortDefinitions, value: sort, onChange: setSort }}
          {...tableSelectionProps}
          columns={columns}
          data={items}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.trendingSearches}
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

      <TrendingSearchViewDialog
        open={dialog.mode === "view"}
        item={viewingItem}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(entity) => dialog.openEdit(entity)}
        onDelete={(entity) => dialog.openDelete(entity)}
      />

      <TrendingSearchFormDrawer
        open={isFormOpen}
        mode={formMode}
        item={dialog.entity}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onSuccess={refetch}
      />

      <CrudBulkDeleteDialog {...bulkDeleteDialogProps} />

      <CrudDeleteDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        entityLabel={
          dialog.entity
            ? formatBilingualLabel(
                getBilingualTitle(dialog.entity.translations, dialog.entity.label),
              )
            : undefined
        }
        isLoading={isDeleting}
        onConfirm={async () => {
          if (dialog.entity) {
            const result = await deleteMutation.mutate(dialog.entity);
            if (result.ok) dialog.close();
          }
        }}
      />
    </CrudListPage>
  );
}
