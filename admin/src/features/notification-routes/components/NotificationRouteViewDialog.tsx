import { FlaskConical } from "lucide-react";
import { useState } from "react";

import { useNotificationRouteMutations } from "@/features/notification-routes/hooks/use-notification-route-mutations";
import type { NotificationRoute } from "@/features/notification-routes/types/notification-routes.types";
import {
  getNotificationRouteCounts,
  getNotificationRouteVisual,
} from "@/features/notification-routes/utils/notification-route-display.utils";
import { AppBadge, AppButton, ConfirmDialog, UserLabelText } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type NotificationRouteViewDialogProps = {
  open: boolean;
  entity: NotificationRoute | null;
  canUpdate?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (entity: NotificationRoute) => void;
};

export function NotificationRouteViewDialog({
  open,
  entity,
  canUpdate = false,
  onOpenChange,
  onEdit,
}: NotificationRouteViewDialogProps) {
  const t = useTranslation();
  const [showSendTestConfirm, setShowSendTestConfirm] = useState(false);
  const { sendTest, isSendingTest } = useNotificationRouteMutations();

  if (!entity) return null;

  const visual = getNotificationRouteVisual(entity.event.value);
  const Icon = visual.icon;
  const { recipientsCount, inAppCount, emailCount, isFallback } = getNotificationRouteCounts(
    entity.recipients,
  );

  const sections: CrudViewDialogSection[] = [
    {
      id: "details",
      title: t.notificationRouteDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.notificationRouteEvent}>
            <div className="space-y-1">
              <div className="font-medium text-foreground">{entity.event.label}</div>
              <div className="font-mono text-xs text-muted-foreground">{entity.event.value}</div>
            </div>
          </CrudDetailField>
          <CrudDetailField label={t.notificationRouteRecipientsCount}>{recipientsCount}</CrudDetailField>
          <CrudDetailField label={t.notificationRouteInAppCount}>{inAppCount}</CrudDetailField>
          <CrudDetailField label={t.notificationRouteEmailCount}>{emailCount}</CrudDetailField>
          <CrudDetailField label={t.notificationRouteFallbackLabel}>
            {isFallback ? (
              <AppBadge label={t.notificationRouteFallbackLabel} variant="warning" />
            ) : (
              <AppBadge label={t.notificationRouteConfigured} variant="brand" />
            )}
          </CrudDetailField>
        </div>
      ),
    },
    {
      id: "recipients",
      title: t.notificationRouteRecipients,
      content: (
        <div className="space-y-3">
          {isFallback ? (
            <div className="rounded-xl border border-dashed border-warning/40 bg-warning/5 p-4 text-sm text-muted-foreground">
              {t.notificationRouteFallbackHint}
            </div>
          ) : (
            entity.recipients.map((recipient) => (
              <div
                key={recipient.userId}
                className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand"
                    aria-hidden="true"
                  >
                    {(recipient.fullName || recipient.userEmail || "?")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      <UserLabelText
                        value={recipient.fullName || recipient.userEmail || `#${recipient.userId}`}
                      />
                    </p>
                    {recipient.userEmail ? (
                      <p className="truncate text-xs text-muted-foreground">{recipient.userEmail}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipient.inApp ? (
                    <AppBadge label={t.notificationRouteInApp} variant="brand" />
                  ) : null}
                  {recipient.email ? <AppBadge label={t.email} variant="neutral" /> : null}
                </div>
              </div>
            ))
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <CrudViewDialog
        open={open}
        entity={entity}
        onOpenChange={onOpenChange}
        title={t.viewNotificationRoute}
        cancelLabel={t.cancel}
        canUpdate={canUpdate}
        editLabel={t.editAction}
        onEdit={onEdit}
        sections={sections}
        footerActions={
          canUpdate ? (
            <AppButton
              variant="outline"
              disabled={isSendingTest}
              isLoading={isSendingTest}
              loadingText={t.notificationRouteSendTestLoading}
              onClick={() => setShowSendTestConfirm(true)}
            >
              <FlaskConical className="size-4" aria-hidden="true" />
              {t.notificationRouteSendTest}
            </AppButton>
          ) : null
        }
        hero={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div
              className={cn(
                "flex size-20 shrink-0 items-center justify-center rounded-2xl",
                visual.chipClass,
              )}
              aria-hidden="true"
            >
              <Icon className={cn("size-9", visual.iconClass)} />
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="text-lg font-semibold text-foreground">{entity.event.label}</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">{entity.event.value}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {isFallback ? (
                  <AppBadge label={t.notificationRouteFallbackLabel} variant="warning" />
                ) : (
                  <AppBadge label={t.notificationRouteConfigured} variant="brand" />
                )}
                <AppBadge label={`${recipientsCount} ${t.notificationRouteRecipientsCountLabel}`} />
                <AppBadge label={`${inAppCount} ${t.notificationRouteInAppCountLabel}`} />
                <AppBadge label={`${emailCount} ${t.notificationRouteEmailCountLabel}`} />
              </div>
            </div>
          </div>
        }
      />

      <ConfirmDialog
        open={showSendTestConfirm}
        onOpenChange={setShowSendTestConfirm}
        title={t.notificationRouteSendTestConfirmTitle}
        description={t.notificationRouteSendTestConfirmDescription}
        confirmLabel={t.notificationRouteSendTest}
        cancelLabel={t.cancel}
        isLoading={isSendingTest}
        onConfirm={() => {
          void (async () => {
            await sendTest(entity.event.value);
            setShowSendTestConfirm(false);
          })();
        }}
      />
    </>
  );
}
