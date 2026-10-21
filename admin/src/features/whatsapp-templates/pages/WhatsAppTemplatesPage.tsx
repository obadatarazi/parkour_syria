import { RefreshCw, Send } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { useAbility, useCrudPermissions } from "@/features/auth";
import { WhatsAppTemplateFormDrawer } from "@/features/whatsapp-templates/components/WhatsAppTemplateFormDrawer";
import { WhatsAppTemplateTestDialog } from "@/features/whatsapp-templates/components/WhatsAppTemplateTestDialog";
import { WhatsAppTemplateViewDialog } from "@/features/whatsapp-templates/components/WhatsAppTemplateViewDialog";
import { useWhatsAppTemplateMutations } from "@/features/whatsapp-templates/hooks/use-whatsapp-template-mutations";
import { useWhatsAppTemplatesList } from "@/features/whatsapp-templates/hooks/use-whatsapp-templates-list";
import type { WhatsAppTemplate } from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import { canDisableWhatsAppTemplate } from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import {
  resolveWhatsAppTemplateStatusLabel,
  whatsAppTemplateStatusVariant,
} from "@/features/whatsapp-templates/utils/whatsapp-template-display";
import { AppButton, ConfirmDialog, StatusBadge } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  CrudTableBooleanToggle,
  useCrudDialog,
  useCrudQuickToggle,
  useCrudRowActions,
} from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import { formatDateTime } from "@/shared/lib/datetime.utils";

export function WhatsAppTemplatesPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const ability = useAbility();
  const guidance = useCrudPageGuidance("whatsapp-templates");
  const { canManage, canShow, canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_WHATSAPP_TEMPLATE);
  const canSendTest =
    canManage || ability.can(PERMISSIONS.PERMISSION_SEND_TEST_WHATSAPP_TEMPLATE, "all");
  const canSync = canManage || canShow || canUpdate;
  const dialog = useCrudDialog<WhatsAppTemplate>();
  const [disableTarget, setDisableTarget] = useState<WhatsAppTemplate | null>(null);
  const [testTarget, setTestTarget] = useState<WhatsAppTemplate | null>(null);

  const {
    items,
    catalog,
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
  } = useWhatsAppTemplatesList();

  const { quickToggle, syncMutation, isSyncing } = useWhatsAppTemplateMutations({
    onSuccess: refetch,
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<WhatsAppTemplate>({
    patchItems,
    toggle: (entity, field, value) => {
      if (field !== "isEnabled") return Promise.resolve(undefined);
      return quickToggle(entity, "isEnabled", value);
    },
  });

  const requestSwitch = useCallback(
    (entity: WhatsAppTemplate, field: keyof WhatsAppTemplate & string, value: boolean) => {
      if (field === "isEnabled" && value === false) {
        setDisableTarget(entity);
        return;
      }
      void handleToggle(entity, field, value);
    },
    [handleToggle],
  );

  const confirmDisable = useCallback(async () => {
    if (!disableTarget) return;
    await handleToggle(disableTarget, "isEnabled", false);
    setDisableTarget(null);
  }, [disableTarget, handleToggle]);

  const isDisabling = disableTarget != null && isToggleLoading(disableTarget.id, "isEnabled");
  const isFormOpen = dialog.mode === "edit";

  const baseRowActions = useCrudRowActions<WhatsAppTemplate>({
    dialog,
    canUpdate,
    canDelete: false,
    t,
  });

  const rowActions = useMemo(() => {
    if (!canSendTest) return baseRowActions;
    return [
      ...baseRowActions,
      {
        id: "test",
        label: t.whatsappTemplateSendTest,
        icon: Send,
        onSelect: (entity: WhatsAppTemplate) => setTestTarget(entity),
      },
    ];
  }, [baseRowActions, canSendTest, t]);

  const columns = useMemo(
    () => [
      {
        id: "label",
        hideable: false,
        header: t.whatsappTemplateEvent,
        cell: (entity: WhatsAppTemplate) => (
          <CrudEntityNameCell
            placeholder="💬"
            size="sm"
            onClick={() => dialog.openView(entity)}
            actions={
              <CrudTableActions entity={entity} actions={rowActions} ariaLabel={t.actions} />
            }
          >
            <span className="block">{entity.label}</span>
            <span className="mt-0.5 block font-mono text-xs text-muted-foreground">{entity.event}</span>
          </CrudEntityNameCell>
        ),
      },
      {
        id: "templateName",
        header: t.whatsappTemplateName,
        cell: (entity: WhatsAppTemplate) => (
          <div className="min-w-0">
            <p className="truncate">{entity.templateName ?? "—"}</p>
            {entity.language ? (
              <p className="text-xs text-muted-foreground">{entity.language}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: "status",
        header: t.whatsappTemplateStatus,
        cell: (entity: WhatsAppTemplate) => (
          <div className="flex flex-col items-start gap-1">
            <StatusBadge
              label={resolveWhatsAppTemplateStatusLabel(
                entity.status.value,
                entity.status.label,
                t,
              )}
              variant={whatsAppTemplateStatusVariant(entity.status.value)}
            />
            {entity.isCritical ? (
              <StatusBadge label={t.whatsappTemplateCritical} variant="warning" />
            ) : null}
          </div>
        ),
      },
      {
        id: "isEnabled",
        header: t.whatsappTemplateSwitch,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (entity: WhatsAppTemplate) => (
          <CrudTableBooleanToggle
            entity={entity}
            field="isEnabled"
            checked={entity.isEnabled}
            canUpdate={canUpdate && (entity.isEnabled ? canDisableWhatsAppTemplate(entity, canManage) : true)}
            isLoading={isToggleLoading(entity.id, "isEnabled")}
            ariaLabel={`${t.whatsappTemplateSwitch}: ${entity.label}`}
            onToggle={(row, field, value) => requestSwitch(row, field, value)}
          />
        ),
      },
      {
        id: "note",
        header: t.whatsappTemplateNote,
        cell: (entity: WhatsAppTemplate) => (
          <span className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
            {entity.note ?? "—"}
          </span>
        ),
      },
    ],
    [canManage, canUpdate, dialog, isToggleLoading, requestSwitch, rowActions, t],
  );

  const catalogNotice =
    catalog && (!catalog.ok || catalog.stale) ? (
      <div
        className="rounded-xl border border-warning/30 bg-warning-muted px-4 py-3 text-sm text-foreground"
        role="status"
      >
        <p>{catalog.error || t.whatsappTemplateCatalogStale}</p>
        {catalog.syncedAt ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {t.whatsappTemplateSyncedAt}: {formatDateTime(catalog.syncedAt, language)}
          </p>
        ) : null}
      </div>
    ) : null;

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.whatsappTemplates}
      description={t.whatsappTemplatesDescription}
      actions={
        canSync ? (
          <AppButton
            variant="outline"
            isLoading={isSyncing}
            loadingText={t.whatsappTemplateSyncing}
            onClick={() => {
              void syncMutation.mutate(undefined);
            }}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {t.whatsappTemplateSync}
          </AppButton>
        ) : undefined
      }
    >
      {catalogNotice}
      <CrudListSection>
        <CrudListTable
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          tableId="whatsapp-templates"
          search={{ value: search, onChange: setSearch, onReset: resetSearch }}
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
          emptyDescription={t.whatsappTemplatesEmptyDescription}
          caption={t.whatsappTemplates}
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

      <WhatsAppTemplateViewDialog
        open={dialog.mode === "view"}
        entity={dialog.entity}
        canUpdate={canUpdate}
        canSendTest={canSendTest}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(entity) => dialog.openEdit(entity)}
        onSendTest={(entity) => setTestTarget(entity)}
      />

      <WhatsAppTemplateFormDrawer
        open={isFormOpen}
        entity={dialog.entity}
        canTurnOff={dialog.entity ? canDisableWhatsAppTemplate(dialog.entity, canManage) : true}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onSuccess={refetch}
      />

      <WhatsAppTemplateTestDialog
        open={testTarget != null}
        entity={testTarget}
        onOpenChange={(open) => {
          if (!open) setTestTarget(null);
        }}
      />

      <ConfirmDialog
        open={disableTarget != null}
        onOpenChange={(open) => {
          if (!open && !isDisabling) setDisableTarget(null);
        }}
        title={t.whatsappTemplateUnpublishTitle}
        description={
          disableTarget
            ? `${disableTarget.label}. ${t.whatsappTemplateUnpublishDescription}`
            : t.whatsappTemplateUnpublishDescription
        }
        confirmLabel={t.whatsappTemplateUnpublishConfirm}
        cancelLabel={t.cancel}
        variant="destructive"
        isLoading={isDisabling}
        onConfirm={() => {
          void confirmDisable();
        }}
      />
    </CrudListPage>
  );
}
