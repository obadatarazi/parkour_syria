import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { TagFormDrawer } from "@/features/tags/components/TagFormDrawer";
import { TagViewDialog } from "@/features/tags/components/TagViewDialog";
import {
  type TagQuickToggleField,
  useTagMutations,
} from "@/features/tags/hooks/use-tag-mutations";
import { useTagsList } from "@/features/tags/hooks/use-tags-list";
import { tagsService } from "@/features/tags/services/tags.service";
import type { Tag } from "@/features/tags/types/tags.types";
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

export function TagsPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("tags");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_TAG);
  const dialog = useCrudDialog<Tag>();
  const {
    items: tags,
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
  } = useTagsList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => tagsService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useTagMutations({
    onSuccess: async () => {
      await refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<Tag>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as TagQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  // List is slim (no slug). View loads Details via getById.
  const { data: tagDetail } = useCrudQuery({
    queryKey: ["tags", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => tagsService.getById(dialog.entity!.id),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewingTag = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    return (
      tagDetail ??
      tags.find((tag) => tag.id === dialog.entity?.id) ??
      dialog.entity
    );
  }, [dialog.entity, dialog.mode, tagDetail, tags]);

  const rowActions = useCrudRowActions<Tag>({
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
        cell: (tag: Tag) => {
          const title = getBilingualTitle(tag.translations, tag.title);
          return (
            <CrudEntityNameCell
              placeholder="🏷️"
              size="sm"
              onClick={() => dialog.openView(tag)}
              actions={
                <CrudTableActions entity={tag} actions={rowActions} ariaLabel={t.actions} />
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
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (tag: Tag) => (
          <CrudTableBooleanToggle
            entity={tag}
            field="publish"
            checked={tag.publish ?? false}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(tag.id, "publish")}
            ariaLabel={`${t.status}: ${formatBilingualLabel(getBilingualTitle(tag.translations, tag.title))}`}
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
      title={t.tags}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addTag}
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
          tableId="tags"
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
          {...tableSelectionProps}
          columns={columns}
          data={tags}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.tags}
          showingLabel={`${t.showing} ${tags.length} ${t.of} ${total} ${t.results}`}
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

      <TagViewDialog
        open={dialog.mode === "view"}
        tag={viewingTag}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(tag) => dialog.openEdit(tag)}
        onDelete={(tag) => dialog.openDelete(tag)}
      />

      <TagFormDrawer
        open={isFormOpen}
        mode={formMode}
        tag={dialog.entity}
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
            ? formatBilingualLabel(getBilingualTitle(dialog.entity.translations, dialog.entity.title))
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
