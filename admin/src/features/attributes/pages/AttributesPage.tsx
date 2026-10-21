import { Plus } from "lucide-react";
import { useMemo } from "react";

import { AttributeFormDrawer } from "@/features/attributes/components/AttributeFormDrawer";
import { AttributeManageDrawer } from "@/features/attributes/components/AttributeManageDrawer";
import {
  type AttributeQuickToggleField,
  useAttributeMutations,
} from "@/features/attributes/hooks/use-attribute-mutations";
import { useAttributesList } from "@/features/attributes/hooks/use-attributes-list";
import { attributesService } from "@/features/attributes/services/attributes.service";
import type { Attribute } from "@/features/attributes/types/attributes.types";
import { getAttributeValueLabel, getAttributeValueTitlePreviewLabel } from "@/features/attributes/utils/attribute-display.utils";
import { useCrudPermissions } from "@/features/auth";
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

export function AttributesPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("attributes");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_ATTRIBUTE);
  const dialog = useCrudDialog<Attribute>();
  const {
    items: attributes,
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
  } = useAttributesList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => attributesService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useAttributeMutations({
    onSuccess: async () => {
      await refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<Attribute>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as AttributeQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  const rowActions = useCrudRowActions<Attribute>({
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
        cell: (attribute: Attribute) => {
          const title = getBilingualTitle(attribute.translations, attribute.title);
          return (
            <CrudEntityNameCell
              size="sm"
              onClick={() => dialog.openView(attribute)}
              actions={
                <CrudTableActions
                  entity={attribute}
                  actions={rowActions}
                  ariaLabel={t.actions}
                />
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
        id: "values",
        header: t.attributeValues,
        cell: (attribute: Attribute) => {
          const previewTitles = attribute.valueTitles ?? [];
          const fullValues = attribute.values ?? [];
          const totalCount = attribute.valuesCount ?? fullValues.length;

          if (totalCount <= 0 && previewTitles.length === 0 && fullValues.length === 0) {
            return <span className="text-sm text-muted-foreground">{t.notSet}</span>;
          }

          if (previewTitles.length > 0) {
            const hiddenCount = Math.max(0, totalCount - previewTitles.length);
            return (
              <div className="flex flex-wrap items-center gap-1.5">
                {previewTitles.map((titles, index) => (
                  <AppBadge
                    key={`${attribute.id}-preview-${index}`}
                    label={getAttributeValueTitlePreviewLabel(titles)}
                    variant="neutral"
                    className="font-medium"
                  />
                ))}
                {hiddenCount > 0 ? (
                  <span className="text-xs text-muted-foreground">+{hiddenCount}</span>
                ) : null}
              </div>
            );
          }

          const visibleValues = fullValues.slice(0, 4);
          const hiddenCount = fullValues.length - visibleValues.length;

          return (
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleValues.map((value) => (
                <AppBadge
                  key={value.id}
                  label={getAttributeValueLabel(value)}
                  variant="neutral"
                  className="font-medium"
                />
              ))}
              {hiddenCount > 0 ? (
                <span className="text-xs text-muted-foreground">+{hiddenCount}</span>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (attribute: Attribute) => (
          <CrudTableBooleanToggle
            entity={attribute}
            field="publish"
            checked={attribute.publish ?? false}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(attribute.id, "publish")}
            ariaLabel={`${t.status}: ${formatBilingualLabel(getBilingualTitle(attribute.translations, attribute.title))}`}
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
      title={t.attributes}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addAttribute}
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
          tableId="attributes"
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
          data={attributes}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.attributes}
          showingLabel={`${t.showing} ${attributes.length} ${t.of} ${total} ${t.results}`}
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

      <AttributeManageDrawer
        open={dialog.mode === "view"}
        attribute={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(attribute) => {
          dialog.close();
          dialog.openEdit(attribute);
        }}
        onDelete={(attribute) => dialog.openDelete(attribute)}
        onValuesChanged={refetch}
      />

      <AttributeFormDrawer
        open={isFormOpen}
        mode={formMode}
        attribute={dialog.entity}
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
                getBilingualTitle(dialog.entity.translations, dialog.entity.title),
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
