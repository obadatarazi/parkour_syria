import { Plus } from "lucide-react";
import { useMemo } from "react";

import { AttributeValueFormDrawer } from "@/features/attribute-values/components/AttributeValueFormDrawer";
import { AttributeValueViewDialog } from "@/features/attribute-values/components/AttributeValueViewDialog";
import {
  type AttributeValueQuickToggleField,
  useAttributeValueMutations,
} from "@/features/attribute-values/hooks/use-attribute-value-mutations";
import { useAttributeValuesList } from "@/features/attribute-values/hooks/use-attribute-values-list";
import { attributeValuesService } from "@/features/attribute-values/services/attribute-values.service";
import type { AttributeValue } from "@/features/attribute-values/types/attribute-values.types";
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

export function AttributeValuesPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("attribute-values");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_ATTRIBUTE_VALUE);
  const dialog = useCrudDialog<AttributeValue>();
  const {
    items: attributeValues,
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
  } = useAttributeValuesList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => attributeValuesService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useAttributeValueMutations({
    onSuccess: async () => {
      await refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<AttributeValue>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as AttributeValueQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  const rowActions = useCrudRowActions<AttributeValue>({
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
        cell: (attributeValue: AttributeValue) => {
          const title = getBilingualTitle(attributeValue.translations, attributeValue.title);
          return (
            <CrudEntityNameCell
              placeholder="🎯"
              size="sm"
              onClick={() => dialog.openView(attributeValue)}
              actions={
                <CrudTableActions
                  entity={attributeValue}
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
        id: "attribute",
        header: t.attribute,
        cell: (attributeValue: AttributeValue) => {
          const attributeTitle = attributeValue.attribute
            ? getBilingualTitle(attributeValue.attribute.translations, attributeValue.attribute.title)
            : { en: "", ar: "" };
          return (
            <span className="text-sm text-muted-foreground">
              {formatBilingualLabel(attributeTitle) || "—"}
            </span>
          );
        },
      },
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (attributeValue: AttributeValue) => (
          <CrudTableBooleanToggle
            entity={attributeValue}
            field="publish"
            checked={attributeValue.publish ?? false}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(attributeValue.id, "publish")}
            ariaLabel={`${t.status}: ${formatBilingualLabel(getBilingualTitle(attributeValue.translations, attributeValue.title))}`}
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
      title={t.attributeValues}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addAttributeValue}
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
          tableId="attribute-values"
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
          data={attributeValues}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.attributeValues}
          showingLabel={`${t.showing} ${attributeValues.length} ${t.of} ${total} ${t.results}`}
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

      <AttributeValueViewDialog
        open={dialog.mode === "view"}
        attributeValue={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(attributeValue) => dialog.openEdit(attributeValue)}
        onDelete={(attributeValue) => dialog.openDelete(attributeValue)}
      />

      <AttributeValueFormDrawer
        open={isFormOpen}
        mode={formMode}
        attributeValue={dialog.entity}
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
