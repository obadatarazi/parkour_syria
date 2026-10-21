import { Plus } from "lucide-react";
import { useCallback, useMemo } from "react";
import { Link } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { canAccessRoute, useAbility, useCrudPermissions } from "@/features/auth";
import { SettingFormDrawer } from "@/features/settings/components/SettingFormDrawer";
import { SettingInlineValueCell } from "@/features/settings/components/SettingInlineValueCell";
import type { SettingGroupId } from "@/features/settings/constants/setting-groups";
import { useSettingMutations } from "@/features/settings/hooks/use-setting-mutations";
import { useSettingsList } from "@/features/settings/hooks/use-settings-list";
import type { MultiTypeSetting } from "@/features/settings/types/settings.types";
import { groupSettingsByPurpose } from "@/features/settings/utils/group-settings";
import {
  getSettingDescription,
  getSettingTitle,
  parseSettingBoolean,
} from "@/features/settings/utils/setting-display";
import { AppButton } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudExportMenu,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableControls,
  useCrudDialog,
} from "@/shared/crud";
import { Button } from "@/shared/design-system/components/ui/button";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { Translation } from "@/shared/design-system/localization/locales/en";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";

function getSettingGroupCopy(t: Translation, groupId: SettingGroupId) {
  switch (groupId) {
    case "site":
      return { title: t.settingsGroupSite, description: t.settingsGroupSiteDescription };
    case "whatsapp":
      return { title: t.settingsGroupWhatsapp, description: t.settingsGroupWhatsappDescription };
    case "social":
      return { title: t.settingsGroupSocial, description: t.settingsGroupSocialDescription };
    case "safety":
      return { title: t.settingsGroupSafety, description: t.settingsGroupSafetyDescription };
    case "other":
      return { title: t.settingsGroupInternal, description: t.settingsGroupInternalDescription };
  }
}

function formatSettingValue(setting: MultiTypeSetting, t: Translation): string {
  if (setting.type === "BOOLEAN") {
    return parseSettingBoolean(setting.value) ? t.active : t.inactive;
  }
  return setting.value || "—";
}

export function SettingsPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("settings");
  const ability = useAbility();
  const { canCreate, canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_MULTI_TYPE_SETTING);
  const canManageRoles = canAccessRoute(ability, PERMISSIONS.MANAGE_ROLE);
  const dialog = useCrudDialog<MultiTypeSetting>();
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
    filters,
    filterDefinitions,
    sort,
    setSort,
    sortDefinitions,
    exportCsv,
    isExportingCsv,
  } = useSettingsList();

  const groupedSettings = useMemo(() => groupSettingsByPurpose(settings), [settings]);

  const { updateMutation } = useSettingMutations({
    onSuccess: refetch,
  });

  const saveSettingValue = useCallback(
    async (setting: MultiTypeSetting, nextValue: string): Promise<boolean> => {
      const result = await updateMutation.mutate({
        id: setting.id,
        data: { value: nextValue },
      });
      return result.ok;
    },
    [updateMutation],
  );

  const isFormOpen = dialog.mode === "create";

  const columns = useMemo(
    () => [
      {
        id: "settingKey",
        header: t.settingKey,
        className: "w-[42%] align-middle whitespace-normal",
        headerClassName: "w-[42%]",
        cell: (setting: MultiTypeSetting) => (
          <div>
            <p className="font-medium">{getSettingTitle(setting.settingKey, t)}</p>
            <p className="text-xs text-muted-foreground">
              {getSettingDescription(setting.settingKey, setting.description, t)}
            </p>
          </div>
        ),
      },
      {
        id: "value",
        header: t.value,
        className: "w-[58%] align-middle whitespace-normal text-start",
        headerClassName: "w-[58%] text-start",
        cell: (setting: MultiTypeSetting) => (
          <SettingInlineValueCell
            setting={setting}
            displayValue={formatSettingValue(setting, t)}
            canEdit={canUpdate}
            editHint={t.settingInlineEditHint}
            cancelLabel={t.cancel}
            activeLabel={t.active}
            inactiveLabel={t.inactive}
            onSave={(nextValue) => saveSettingValue(setting, nextValue)}
          />
        ),
      },
    ],
    [canUpdate, saveSettingValue, t],
  );

  const showPagination = total > pageSize;

  return (
    <>
      <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-foreground">{t.manageUserRoles}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.manageUserRolesDescription}</p>
            </div>
            {canManageRoles ? (
              <Button asChild variant="outline" className="rounded-xl">
                <Link to={ROUTES.admin.roles}>{t.userRoles}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <CrudListPage
        {...guidance.pageProps}
        title={t.siteSettings}
        description={t.siteSettingsDescription}
        actions={
          canCreate ? (
            <AppButton onClick={dialog.openCreate}>
              <Plus className="size-4" aria-hidden="true" />
              {t.addSetting}
            </AppButton>
          ) : undefined
        }
      >
        <CrudListSection>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <CrudTableControls
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
                <CrudExportMenu onExportCsv={exportCsv} isExporting={isExportingCsv} />
              }
            />
          </div>
        </CrudListSection>

        {groupedSettings.length === 0 ? (
          <CrudListSection>
            <CrudListTable
              guidanceAnchors={{
                search: guidance.searchDataGuidance,
                filters: guidance.filtersDataGuidance,
              }}
              tableId="settings-empty"
              enableColumnVisibility={false}
              tableClassName="table-fixed"
              columns={columns}
              data={[]}
              isLoading={isLoading}
              isError={isError}
              errorTitle={t.errorStateDefaultTitle}
              errorDescription={resolveServiceErrorMessage(error, t)}
              retryLabel={t.tryAgain}
              onRetry={() => void refetch()}
              emptyTitle={t.noData}
              emptyDescription={t.emptyStateDefaultDescription}
              caption={t.siteSettings}
            />
          </CrudListSection>
        ) : (
          groupedSettings.map((group, groupIndex) => {
            const copy = getSettingGroupCopy(t, group.id);
            const isLastGroup = groupIndex === groupedSettings.length - 1;

            return (
              <CrudListSection key={group.id} title={copy.title} description={copy.description}>
                <CrudListTable
                  tableId={`settings-${group.id}`}
                  enableColumnVisibility={false}
                  tableClassName="table-fixed"
                  columns={columns}
                  data={group.settings}
                  isLoading={isLoading}
                  isError={isError}
                  errorTitle={t.errorStateDefaultTitle}
                  errorDescription={resolveServiceErrorMessage(error, t)}
                  retryLabel={t.tryAgain}
                  onRetry={() => void refetch()}
                  emptyTitle={t.noData}
                  emptyDescription={t.emptyStateDefaultDescription}
                  caption={copy.title}
                  showingLabel={
                    isLastGroup
                      ? `${t.showing} ${settings.length} ${t.of} ${total} ${t.results}`
                      : undefined
                  }
                  pagination={
                    isLastGroup && showPagination
                      ? {
                          page,
                          pageSize,
                          totalItems: total,
                          onPageChange: setPage,
                          onPageSizeChange: setPageSize,
                          pageSizeLabel: t.perPage,
                          previousLabel: t.previous,
                          nextLabel: t.nextPage,
                        }
                      : undefined
                  }
                />
              </CrudListSection>
            );
          })
        )}

        <SettingFormDrawer
          open={isFormOpen}
          mode="create"
          onOpenChange={(open) => {
            if (!open) dialog.close();
          }}
          onSuccess={refetch}
        />
      </CrudListPage>
    </>
  );
}
