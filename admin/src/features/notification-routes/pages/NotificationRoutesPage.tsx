import { useState } from "react";

import { useCrudPermissions } from "@/features/auth";
import { NotificationRouteCard } from "@/features/notification-routes/components/NotificationRouteCard";
import { NotificationRouteFormDrawer } from "@/features/notification-routes/components/NotificationRouteFormDrawer";
import { NotificationRouteStats } from "@/features/notification-routes/components/NotificationRouteStats";
import { NotificationRouteViewDialog } from "@/features/notification-routes/components/NotificationRouteViewDialog";
import { useNotificationRouteMutations } from "@/features/notification-routes/hooks/use-notification-route-mutations";
import { useNotificationRoutesList } from "@/features/notification-routes/hooks/use-notification-routes-list";
import type { NotificationRoute } from "@/features/notification-routes/types/notification-routes.types";
import {
  AppButton,
  AppCard,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  SearchField,
  TableSkeleton,
} from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { CrudListPage, CrudListSection, useCrudDialog } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

export function NotificationRoutesPage() {
  const t = useTranslation();
  const { canUpdate, canShow } = useCrudPermissions(PERMISSIONS.MANAGE_NOTIFICATION);
  const dialog = useCrudDialog<NotificationRoute>();
  const [testTarget, setTestTarget] = useState<NotificationRoute | null>(null);
  const { items, allItems, search, setSearch, resetSearch, isLoading, isError, error, refetch } =
    useNotificationRoutesList();
  const { sendTest, isSendingTest } = useNotificationRouteMutations();

  return (
    <CrudListPage title={t.notificationRoutes} description={t.notificationRoutesDescription}>
      <div className="space-y-5">
        <NotificationRouteStats items={allItems} isLoading={isLoading} />

        <CrudListSection>
          <AppCard padding="none" className="overflow-hidden">
            <div className="border-b border-border/70 bg-muted/20 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{t.notificationRouteEvent}</p>
                  <p className="text-xs text-muted-foreground">{t.notificationRouteFallbackHint}</p>
                </div>
                <div className="w-full sm:max-w-sm">
                  <SearchField
                    value={search}
                    onChange={setSearch}
                    onReset={resetSearch}
                    placeholder={t.search}
                    ariaLabel={t.search}
                    fullWidth
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-5">
                <TableSkeleton rows={6} />
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
                  title={t.noData}
                  description={t.notificationRoutesEmptyDescription}
                />
              </div>
            ) : (
              <div className="space-y-3 p-4 sm:p-5">
                {items.map((route) => (
                  <NotificationRouteCard
                    key={route.id}
                    route={route}
                    canShow={canShow}
                    canUpdate={canUpdate}
                    onView={dialog.openView}
                    onEdit={dialog.openEdit}
                    onSendTest={setTestTarget}
                  />
                ))}
              </div>
            )}
          </AppCard>
        </CrudListSection>
      </div>

      <NotificationRouteViewDialog
        open={dialog.mode === "view"}
        entity={dialog.entity}
        canUpdate={canUpdate}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(entity) => dialog.openEdit(entity)}
      />

      <NotificationRouteFormDrawer
        open={dialog.mode === "edit"}
        entity={dialog.entity}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={testTarget !== null}
        onOpenChange={(open) => {
          if (!open) setTestTarget(null);
        }}
        title={t.notificationRouteSendTestConfirmTitle}
        description={t.notificationRouteSendTestConfirmDescription}
        confirmLabel={t.notificationRouteSendTest}
        cancelLabel={t.cancel}
        isLoading={isSendingTest}
        onConfirm={() => {
          if (!testTarget) return;
          void (async () => {
            await sendTest(testTarget.event.value);
            setTestTarget(null);
          })();
        }}
      />
    </CrudListPage>
  );
}
