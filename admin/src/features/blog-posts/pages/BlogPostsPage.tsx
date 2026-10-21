import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { BlogPostFormDrawer } from "@/features/blog-posts/components/BlogPostFormDrawer";
import { BlogPostViewDialog } from "@/features/blog-posts/components/BlogPostViewDialog";
import { useBlogPostMutations } from "@/features/blog-posts/hooks/use-blog-post-mutations";
import { useBlogPostsList } from "@/features/blog-posts/hooks/use-blog-posts-list";
import { blogPostsService } from "@/features/blog-posts/services/blog-posts.service";
import type { BlogPost } from "@/features/blog-posts/types/blog-posts.types";
import { formatEventDateTime } from "@/features/events/utils/event-labels";
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
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { getBilingualField, pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

export function BlogPostsPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_BLOG_POST);
  const dialog = useCrudDialog<BlogPost>();
  const list = useBlogPostsList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => blogPostsService.bulkDelete(ids),
    onSuccess: list.refetch,
  });
  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection: list.selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useBlogPostMutations({
    onSuccess: async () => {
      dialog.close();
      await list.refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<BlogPost>({
    patchItems: list.patchItems,
    toggle: quickToggle,
  });

  const rowActions = useCrudRowActions<BlogPost>({ dialog, canUpdate, canDelete, t });

  const columns = useMemo(
    () => [
      {
        id: "title",
        hideable: false,
        header: t.fieldTitle,
        cell: (post: BlogPost) => (
          <CrudEntityNameCell
            imageUrl={post.imageFileUrl}
            placeholder="📝"
            size="md"
            onClick={() => dialog.openView(post)}
            actions={<CrudTableActions entity={post} actions={rowActions} ariaLabel={t.actions} />}
          >
            <BilingualText values={getBilingualField(post.translations, "title", post.title)} />
          </CrudEntityNameCell>
        ),
      },
      {
        id: "category",
        header: t.fieldCategory,
        cell: (post: BlogPost) =>
          post.category?.title || <span className="text-muted-foreground">—</span>,
      },
      {
        id: "publishedAt",
        header: t.fieldPublishedAt,
        className: "w-44",
        cell: (post: BlogPost) =>
          post.publishedAt ? (
            <span className="text-sm">{formatEventDateTime(post.publishedAt, language)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "publish",
        header: t.publish,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (post: BlogPost) => (
          <CrudTableBooleanToggle
            entity={post}
            field="publish"
            checked={post.publish}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(post.id, "publish")}
            ariaLabel={`${t.publish}: ${pickLocaleText(post.translations, "title", post.title)}`}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, language, rowActions, t],
  );

  return (
    <CrudListPage
      title={t.navBlogPosts}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addBlogPost}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <CrudListTable
          tableId="blog-posts"
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
          caption={t.navBlogPosts}
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

      <BlogPostViewDialog
        open={dialog.mode === "view"}
        post={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => !open && dialog.close()}
        onEdit={dialog.openEdit}
        onDelete={dialog.openDelete}
      />

      <BlogPostFormDrawer
        open={dialog.mode === "create" || dialog.mode === "edit"}
        mode={dialog.mode === "edit" ? "edit" : "create"}
        post={dialog.entity}
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
