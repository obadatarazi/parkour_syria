import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { BlogCategoryFormDrawer } from "@/features/blog-categories/components/BlogCategoryFormDrawer";
import { BlogCategoryViewDialog } from "@/features/blog-categories/components/BlogCategoryViewDialog";
import { useBlogCategoriesList } from "@/features/blog-categories/hooks/use-blog-categories-list";
import { useBlogCategoryMutations } from "@/features/blog-categories/hooks/use-blog-category-mutations";
import { blogCategoriesService } from "@/features/blog-categories/services/blog-categories.service";
import type { BlogCategory } from "@/features/blog-categories/types/blog-categories.types";
import { AppButton, BilingualText } from "@/shared/components";
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
  useCrudQuickToggle,
  useCrudRowActions,
  useCrudTableBulkActions,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { getBilingualField, pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

export function BlogCategoriesPage() {
  const t = useTranslation();
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_BLOG_CATEGORY);
  const dialog = useCrudDialog<BlogCategory>();
  const list = useBlogCategoriesList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => blogCategoriesService.bulkDelete(ids),
    onSuccess: list.refetch,
  });
  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection: list.selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useBlogCategoryMutations({
    onSuccess: async () => {
      dialog.close();
      await list.refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<BlogCategory>({
    patchItems: list.patchItems,
    toggle: quickToggle,
  });

  const rowActions = useCrudRowActions<BlogCategory>({ dialog, canUpdate, canDelete, t });

  const columns = useMemo(
    () => [
      {
        id: "title",
        hideable: false,
        header: t.fieldTitle,
        cell: (blogCategory: BlogCategory) => (
          <CrudEntityNameCell
            placeholder="🗂️"
            onClick={() => dialog.openView(blogCategory)}
            actions={<CrudTableActions entity={blogCategory} actions={rowActions} ariaLabel={t.actions} />}
          >
            <BilingualText values={getBilingualField(blogCategory.translations, "title", blogCategory.title)} />
          </CrudEntityNameCell>
        ),
      },
      {
        id: "slug",
        header: t.slug,
        cell: (blogCategory: BlogCategory) => (
          <span dir="ltr" className="font-mono text-xs text-muted-foreground">
            {blogCategory.slug}
          </span>
        ),
      },
      {
        id: "sortOrder",
        header: t.sortOrder,
        className: "w-24 text-center",
        headerClassName: "text-center",
        cell: (blogCategory: BlogCategory) => blogCategory.sortOrder,
      },
      {
        id: "publish",
        header: t.publish,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (blogCategory: BlogCategory) => (
          <CrudTableBooleanToggle
            entity={blogCategory}
            field="publish"
            checked={blogCategory.publish}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(blogCategory.id, "publish")}
            ariaLabel={`${t.publish}: ${pickLocaleText(blogCategory.translations, "title", blogCategory.title)}`}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, rowActions, t],
  );

  return (
    <CrudListPage
      title={t.navBlogCategories}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addBlogCategory}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <CrudListTable
          tableId="blog-categories"
          onExportCsv={list.exportCsv}
          isExportingCsv={list.isExportingCsv}
          search={{ value: list.search, onChange: list.setSearch, onReset: list.resetSearch }}
          filters={{
            definitions: list.filterDefinitions,
            values: list.filters.values,
            onChange: list.filters.setFilter,
            onReset: list.filters.resetFilters,
            hasActiveFilters: list.filters.hasActiveFilters,
          }}
          sort={{ definitions: list.sortDefinitions, value: list.sort, onChange: list.setSort }}
          {...tableSelectionProps}
          columns={columns}
          data={list.items}
          isLoading={list.isLoading}
          isError={list.isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(list.error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void list.refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.navBlogCategories}
          showingLabel={`${t.showing} ${list.items.length} ${t.of} ${list.total} ${t.results}`}
          pagination={{
            page: list.page,
            pageSize: list.pageSize,
            totalItems: list.total,
            onPageChange: list.setPage,
            onPageSizeChange: list.setPageSize,
            pageSizeLabel: t.perPage,
            previousLabel: t.previous,
            nextLabel: t.nextPage,
          }}
        />
      </CrudListSection>

      <BlogCategoryViewDialog
        open={dialog.mode === "view"}
        blogCategory={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => !open && dialog.close()}
        onEdit={dialog.openEdit}
        onDelete={dialog.openDelete}
      />

      <BlogCategoryFormDrawer
        open={dialog.mode === "create" || dialog.mode === "edit"}
        mode={dialog.mode === "edit" ? "edit" : "create"}
        blogCategory={dialog.entity}
        onOpenChange={(open) => !open && dialog.close()}
        onSuccess={list.refetch}
      />

      <CrudBulkDeleteDialog {...bulkDeleteDialogProps} />

      <CrudDeleteDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => !open && dialog.close()}
        entityLabel={dialog.entity ? pickLocaleText(dialog.entity.translations, "title", dialog.entity.title) : undefined}
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
