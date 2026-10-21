import { CheckCheck } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router";

import { NotificationInboxItem } from "@/features/notifications/components/NotificationInboxItem";
import { NotificationViewDialog } from "@/features/notifications/components/NotificationViewDialog";
import { useNotificationMutations } from "@/features/notifications/hooks/use-notification-mutations";
import { useNotificationsList } from "@/features/notifications/hooks/use-notifications-list";
import { meNotificationsService } from "@/features/notifications/services/me-notifications.service";
import type { Notification } from "@/features/notifications/types/notifications.types";
import { ROUTES } from "@/app/router/routes";
import {
  AppButton,
  AppCard,
  CaptionText,
  EmptyState,
  ErrorState,
  TableSkeleton,
} from "@/shared/components";
import { PAGE_SIZE_OPTIONS } from "@/shared/constants/pagination";
import {
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
 * Personal admin inbox (`/admin/me/notifications`).
 * Header bell + this page. Mark-as-read only — no create/delete.
 */
export function NotificationsPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("notifications");
  const dialog = useCrudDialog<Notification>();
  const [markingReadIds, setMarkingReadIds] = useState<Set<number>>(() => new Set());
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
    patchData,
    data: listData,
    filters,
    filterDefinitions,
    sort,
    setSort,
    sortDefinitions,
  } = useNotificationsList();

  const { markRead, markAllRead, isMarkingAllRead } = useNotificationMutations({
    onSuccess: async () => {
      await refetch();
    },
  });

  const handleMarkRead = useCallback(
    async (notification: Notification) => {
      if (notification.read || markingReadIds.has(notification.id)) return;

      setMarkingReadIds((current) => new Set(current).add(notification.id));
      patchData((previous) => ({
        ...previous,
        unreadCount: Math.max(0, (previous.unreadCount ?? 1) - 1),
        data: previous.data.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      }));

      try {
        await markRead(notification);
      } catch {
        patchData((previous) => ({
          ...previous,
          unreadCount: (previous.unreadCount ?? 0) + 1,
          data: previous.data.map((item) =>
            item.id === notification.id ? { ...item, read: false } : item,
          ),
        }));
      } finally {
        setMarkingReadIds((current) => {
          const next = new Set(current);
          next.delete(notification.id);
          return next;
        });
      }
    },
    [markRead, markingReadIds, patchData],
  );

  const unreadCount =
    listData?.unreadCount ?? items.filter((item) => !item.read).length;

  const { data: detail } = useCrudQuery({
    queryKey: ["me-notifications", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => meNotificationsService.getById(dialog.entity!.id),
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
      title={t.notifications}
      description={
        unreadCount > 0
          ? `${unreadCount} ${t.unread} · ${t.notificationsCenterDescription}`
          : t.notificationsCenterDescription
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <AppButton variant="outline" asChild>
            <Link to={ROUTES.admin.platformNotifications}>{t.platformNotificationsLink}</Link>
          </AppButton>
          <AppButton
            variant="outline"
            onClick={() => void markAllRead()}
            disabled={isMarkingAllRead || unreadCount === 0}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            {t.markAllRead}
          </AppButton>
        </div>
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
                  canMarkRead
                  navigateOnOpen
                  onOpen={dialog.openView}
                  onMarkRead={(entity) => void handleMarkRead(entity)}
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
        canMarkRead
        isReadUpdating={
          viewingEntity ? markingReadIds.has(viewingEntity.id) : false
        }
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onMarkRead={(entity) => void handleMarkRead(entity)}
      />
    </CrudListPage>
  );
}
