import { Pencil } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { VisualSettingFormDrawer } from "@/features/visual-settings/components/VisualSettingFormDrawer";
import { useVisualSettingsList } from "@/features/visual-settings/hooks/use-visual-settings-list";
import type { VisualSetting } from "@/features/visual-settings/types/visual-settings.types";
import { formatVisualSettingKey } from "@/features/visual-settings/types/visual-settings.types";
import { BilingualText, MediaImage } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  useCrudDialog,
  useCrudTableBulkActions,
} from "@/shared/crud";
import type { CrudRowAction } from "@/shared/crud/types/crud.types";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import {
  getBilingualDescription,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";
import { useCrudPageGuidance } from "@/shared/guidance";

export function VisualSettingsPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("visual-settings");
  const { canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_VISUAL_SETTING);
  const dialog = useCrudDialog<VisualSetting>();
  const {
    items: settings,
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
    sort,
    setSort,
    sortDefinitions,
    selection,
  } = useVisualSettingsList();

  const { tableSelectionProps } = useCrudTableBulkActions({
    selection,
    canDelete: false,
    onBulkDelete: async () => undefined,
  });

  const rowActions = useMemo<CrudRowAction<VisualSetting>[]>(() => {
    if (!canUpdate) return [];

    return [
      {
        id: "edit",
        label: t.editAction,
        icon: Pencil,
        onSelect: (setting) => dialog.openEdit(setting),
      },
    ];
  }, [canUpdate, dialog, t]);

  const columns = useMemo(
    () => [
      {
        id: "settingKey",
        header: t.settingKey,
        cell: (setting: VisualSetting) => (
          <div className="flex items-center gap-2.5">
            {setting.imageFileUrl ? (
              <MediaImage
                src={setting.imageFileUrl}
                alt=""
                className="size-8 rounded-lg object-cover"
              />
            ) : null}
            <span className="font-medium">{formatVisualSettingKey(setting.settingKey)}</span>
          </div>
        ),
      },
      {
        id: "title",
        header: t.name,
        cell: (setting: VisualSetting) => (
          <BilingualText values={getBilingualTitle(setting.translations, setting.title)} />
        ),
      },
      {
        id: "description",
        header: t.description,
        className: "max-w-xs",
        cell: (setting: VisualSetting) => (
          <BilingualText
            values={getBilingualDescription(setting.translations, setting.description)}
            titleClassName="font-normal"
          />
        ),
      },
      {
        id: "link",
        header: t.link,
        className: "max-w-xs truncate",
        cell: (setting: VisualSetting) => setting.link ?? t.notSet,
      },
    ],
    [t],
  );

  return (
    <CrudListPage {...guidance.pageProps} title={t.visualSettings}>
      <CrudListSection>
        <CrudListTable
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          tableId="visual-settings"
          search={{ value: search, onChange: setSearch, onReset: resetSearch }}
          sort={{ definitions: sortDefinitions, value: sort, onChange: setSort }}
          {...tableSelectionProps}
          columns={columns}
          data={settings}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          rowActions={
            rowActions.length > 0
              ? (setting) => (
                  <CrudTableActions entity={setting} actions={rowActions} ariaLabel={t.actions} />
                )
              : undefined
          }
          actionsHeader={rowActions.length > 0 ? t.actions : undefined}
          caption={t.visualSettings}
          showingLabel={`${t.showing} ${settings.length} ${t.of} ${total} ${t.results}`}
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

      <VisualSettingFormDrawer
        open={dialog.mode === "edit"}
        setting={dialog.entity}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onSuccess={refetch}
      />
    </CrudListPage>
  );
}
