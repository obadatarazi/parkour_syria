import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { CategoryFormDrawer } from "@/features/categories/components/CategoryFormDrawer";
import { CategoryViewDialog } from "@/features/categories/components/CategoryViewDialog";
import { CategoryVisibilityBadges } from "@/features/categories/components/CategoryVisibilityBadges";
import { useCategoriesList } from "@/features/categories/hooks/use-categories-list";
import {
  type CategoryQuickToggleField,
  useCategoryMutations,
} from "@/features/categories/hooks/use-category-mutations";
import { useCategoryTreeExpansion } from "@/features/categories/hooks/use-category-tree-expansion";
import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category } from "@/features/categories/types/categories.types";
import { getCategoryDepthLabel } from "@/features/categories/utils/category-display.utils";
import {
  buildVisibleCategoryTreeRows,
  CATEGORY_TREE_INDENT_REM,
  categoryCanExpand,
  type CategoryTreeRow,
  getCategoryTreeRowClassName,
  patchCategoryInTree,
} from "@/features/categories/utils/category-tree.utils";
import { AppButton, BilingualText, CategoryImagePlaceholder } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudBulkDeleteDialog,
  CrudDeleteDialog,
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  useCrudBulkDelete,
  useCrudDialog,
  useCrudQuickToggle,
  useCrudRowActions,
  useCrudTableBulkActions,
} from "@/shared/crud";
import { Button } from "@/shared/design-system/components/ui/button";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import {
  formatBilingualLabel,
  getBilingualDescription,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

function getCategoryLabel(category: Category) {
  return formatBilingualLabel(getBilingualTitle(category.translations, category.title));
}

function categoriesToFlatRows(categories: Category[]): CategoryTreeRow[] {
  return categories.map((category) => ({
    id: category.id,
    category,
    treeDepth: 0,
    hasChildren: categoryCanExpand(category),
  }));
}

export function CategoriesPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("categories");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_CATEGORY);
  const dialog = useCrudDialog<Category>();
  const {
    items: categories,
    search,
    setSearch,
    resetSearch,
    page,
    setPage,
    setPageSize,
    total,
    pageSize,
    isLoading,
    isFetching,
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
    scopeDepth,
    exportCsv,
    isExportingCsv,
  } = useCategoriesList();

  const isDepthScope = scopeDepth != null;

  const treeResetKey = useMemo(
    () =>
      [
        search,
        sort,
        filters.values.categoryScope,
        filters.values.publish,
        filters.values.showMenu,
        filters.values.showInHomePage,
        filters.values.feature,
      ].join("|"),
    [filters.values, search, sort],
  );

  const treeExpansion = useCategoryTreeExpansion(treeResetKey, {
    autoExpandEmbedded: search.trim().length > 0 && !isDepthScope,
    categories,
  });

  const tableRows = useMemo(() => {
    if (isDepthScope) {
      return categoriesToFlatRows(categories);
    }

    return buildVisibleCategoryTreeRows(
      categories,
      treeExpansion.expandedIds,
      treeExpansion.resolveChildren,
      treeExpansion.resolveCategory,
    );
  }, [
    categories,
    isDepthScope,
    treeExpansion.expandedIds,
    treeExpansion.resolveChildren,
    treeExpansion.resolveCategory,
  ]);

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => categoriesService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useCategoryMutations({
    onSuccess: refetch,
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<Category>({
    patchItems,
    // Nested tree rows are not roots of `items` — deep-patch the list tree.
    applyListPatch: (entity, field, value) => {
      patchItems((items) =>
        patchCategoryInTree(items, entity.id, { [field]: value } as Partial<Category>),
      );
    },
    // Upsert into the expansion cache so resolveCategory never shadows the toggle.
    patchEntity: (entity, field, value) => {
      treeExpansion.patchCategory(
        entity.id,
        { [field]: value } as Partial<Category>,
        entity,
      );
    },
    toggle: (entity, field, value) =>
      quickToggle(entity, field as CategoryQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  const rowActions = useCrudRowActions<Category>({
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
        header: t.name,
        className: "min-w-0",
        cell: (row: CategoryTreeRow) => {
          const { category, treeDepth, hasChildren } = row;
          const isExpanded = treeExpansion.isExpanded(category.id);
          const isLoadingChildren = treeExpansion.isLoadingChildren(category.id);

          return (
            <div
              className="flex min-w-0 items-center gap-1"
              style={{ paddingInlineStart: `${treeDepth * CATEGORY_TREE_INDENT_REM}rem` }}
            >
              {hasChildren ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground"
                  aria-label={
                    isExpanded ? t.collapseCategoryChildren : t.expandCategoryChildren
                  }
                  aria-expanded={isExpanded}
                  disabled={isLoadingChildren}
                  onClick={() => void treeExpansion.toggleExpanded(category)}
                >
                  {isExpanded ? (
                    <ChevronDown className="size-4" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="size-4" aria-hidden="true" />
                  )}
                </Button>
              ) : (
                <span className="inline-flex size-7 shrink-0" aria-hidden="true" />
              )}

              <CrudEntityNameCell
                imageUrl={category.featureImageFileUrl}
                placeholder={<CategoryImagePlaceholder />}
                onClick={() => dialog.openView(category)}
                actions={
                  <CrudTableActions
                    entity={category}
                    actions={rowActions}
                    ariaLabel={t.actions}
                  />
                }
              >
                <BilingualText values={getBilingualTitle(category.translations, category.title)} />
              </CrudEntityNameCell>
            </div>
          );
        },
      },
      {
        id: "description",
        header: t.description,
        className: "max-w-[14rem]",
        defaultHidden: true,
        cell: (row: CategoryTreeRow) => (
          <div className="line-clamp-2">
            <BilingualText
              values={getBilingualDescription(
                row.category.translations,
                row.category.description,
              )}
              titleClassName="font-normal text-muted-foreground"
            />
          </div>
        ),
      },
      {
        id: "depth",
        header: t.depth,
        className: "w-20 whitespace-nowrap text-center",
        headerClassName: "text-center",
        cell: (row: CategoryTreeRow) => (
          <span className="text-xs tabular-nums text-muted-foreground">
            {getCategoryDepthLabel(row.category.depth, t)}
          </span>
        ),
      },
      {
        id: "visibility",
        header: t.categoryVisibility,
        className: "whitespace-nowrap text-center align-middle",
        headerClassName: "text-center align-middle",
        cell: (row: CategoryTreeRow) => (
          <CategoryVisibilityBadges
            category={row.category}
            compact
            canUpdate={canUpdate}
            onToggle={(field, value) => void handleToggle(row.category, field, value)}
            isToggleLoading={(field) => isToggleLoading(row.category.id, field)}
          />
        ),
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, rowActions, t, treeExpansion],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.categories}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addCategory}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <CrudListTable
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          tableId="categories"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          search={{ value: search, onChange: setSearch, onReset: resetSearch }}
          filters={{
            definitions: filterDefinitions,
            values: filters.values,
            onChange: filters.setFilter,
            onReset: filters.resetFilters,
            hasActiveFilters: filters.hasActiveFilters,
          }}
          sort={{ definitions: sortDefinitions, value: sort, onChange: setSort }}
          toolbarActions={
            isDepthScope ? undefined : (
              <div className="flex flex-wrap items-center gap-2">
                <AppButton
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl text-xs"
                  onClick={() => treeExpansion.expandAll(categories)}
                >
                  <ChevronsUpDown className="size-3.5" aria-hidden="true" />
                  {t.expandAllCategories}
                </AppButton>
                <AppButton
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl text-xs"
                  onClick={treeExpansion.collapseAll}
                >
                  <ChevronsDownUp className="size-3.5" aria-hidden="true" />
                  {t.collapseAllCategories}
                </AppButton>
              </div>
            )
          }
          {...tableSelectionProps}
          columns={columns}
          data={tableRows}
          getRowClassName={(row) => getCategoryTreeRowClassName(row.treeDepth)}
          isLoading={isLoading || isFetching}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.categories}
          showingLabel={`${t.showing} ${tableRows.length} ${t.of} ${total} ${t.results}`}
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

      <CategoryViewDialog
        open={dialog.mode === "view"}
        category={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(category) => dialog.openEdit(category)}
        onDelete={(category) => dialog.openDelete(category)}
      />

      <CategoryFormDrawer
        open={isFormOpen}
        mode={formMode}
        category={dialog.entity}
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
        entityLabel={dialog.entity ? getCategoryLabel(dialog.entity) : undefined}
        isLoading={isDeleting}
        onConfirm={async () => {
          if (dialog.entity) {
            const deletedId = dialog.entity.id;
            const result = await deleteMutation.mutate(dialog.entity);
            if (result.ok) {
              treeExpansion.pruneDeletedCategory(deletedId);
              dialog.close();
            }
          }
        }}
      />
    </CrudListPage>
  );
}
