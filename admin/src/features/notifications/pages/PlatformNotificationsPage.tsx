import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { NotificationFormDrawer } from "@/features/notifications/components/NotificationFormDrawer";
import { NotificationInboxItem } from "@/features/notifications/components/NotificationInboxItem";
import { NotificationViewDialog } from "@/features/notifications/components/NotificationViewDialog";
import { usePlatformNotificationsList } from "@/features/notifications/hooks/use-platform-notifications-list";
import { notificationsService } from "@/features/notifications/services/notifications.service";
import type { Notification } from "@/features/notifications/types/notifications.types";
import {
  AppButton,
  AppCard,
  CaptionText,
  EmptyState,
  ErrorState,
  TableSkeleton,
} from "@/shared/components";
import { PAGE_SIZE_OPTIONS } from "@/shared/constants/pagination";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudExportMenu,
  CrudListPage,
  CrudListSection,
  CrudTableControls,
  useCrudDialog,
  useCrudQuery,
} from "@/shared/crud";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/design-system/components/ui/select";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";

/**
 * Platform-wide notifications (`/admin/notifications` API).
 * View + compose only — no mark-as-read and no delete.
 */
export function PlatformNotificationsPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("platform-notifications");
  const { canCreate } = useCrudPermissions(PERMISSIONS.MANAGE_NOTIFICATION);
  const dialog = useCrudDialog<Notification>();
  const {
    items,
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
  } = usePlatformNotificationsList();

  const { data: detail } = useCrudQuery({
    queryKey: ["platform-notifications", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => notificationsService.getById(dialog.entity!.id),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewingEntity = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    return (
      detail ??
      items.find((item) => item.id === dialog.entity?.id) ??
      dialog.entity
    );
  }, [detail, dialog.entity, dialog.mode, items]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.platformNotifications}
      description={t.platformNotificationsDescription}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addNotification}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <AppCard padding="none" className="overflow-hidden">
          <CrudTableControls
            filters={{
              definitions: filterDefinitions,
              values: filters.values,
              onChange: filters.setFilter,
              onReset: filters.resetFilters,
              hasActiveFilters: filters.hasActiveFilters,
              dataGuidance: guidance.filtersDataGuidance,
            }}
            sort={{ definitions: sortDefinitions, value: sort, onChange: setSort }}
            toolbarActions={
              <CrudExportMenu onExportCsv={exportCsv} isExporting={isExportingCsv} />
            }
          />

          {isLoading ? (
            <div className="p-5">
              <TableSkeleton rows={5} />
            </div>
          ) : isError ? (
            <div className="p-5">
              <ErrorState
                title={t.errorStateDefaultTitle}
                description={resolveServiceErrorMessage(error, t)}
                action={
                  <AppButton variant="outline" onClick={() => void refetch()}>
                    {t.tryAgain}
                  </AppButton>
                }
              />
            </div>
          ) : items.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title={t.noNotifications}
                description={t.emptyStateDefaultDescription}
              />
            </div>
          ) : (
            <div>
              {items.map((notification) => (
                <NotificationInboxItem
                  key={notification.id}
                  notification={notification}
                  navigateOnOpen
                  onOpen={dialog.openView}
                />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <CaptionText>
              {t.showing} {items.length} {t.of} {total} {t.results}
            </CaptionText>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <CaptionText>{t.perPage}</CaptionText>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[4.5rem]" aria-label={t.perPage}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set([...PAGE_SIZE_OPTIONS, pageSize])]
                      .sort((a, b) => a - b)
                      .map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <AppButton
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                {t.previous}
              </AppButton>
              <CaptionText>
                {page} / {totalPages}
              </CaptionText>
              <AppButton
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                {t.nextPage}
              </AppButton>
            </div>
          </div>
        </AppCard>
      </CrudListSection>

      <NotificationViewDialog
        open={dialog.mode === "view"}
        entity={viewingEntity}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
      />

      <NotificationFormDrawer
        open={dialog.mode === "create"}
        mode="create"
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onSuccess={refetch}
      />
    </CrudListPage>
  );
}
