import { Eye, FlaskConical, Pencil } from "lucide-react";

import type { NotificationRoute } from "@/features/notification-routes/types/notification-routes.types";
import {
  getNotificationRouteCounts,
  getNotificationRouteVisual,
} from "@/features/notification-routes/utils/notification-route-display.utils";
import { AppBadge, AppButton, UserLabelText } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type NotificationRouteCardProps = {
  route: NotificationRoute;
  canShow?: boolean;
  canUpdate?: boolean;
  onView?: (route: NotificationRoute) => void;
  onEdit?: (route: NotificationRoute) => void;
  onSendTest?: (route: NotificationRoute) => void;
};

export function NotificationRouteCard({
  route,
  canShow = false,
  canUpdate = false,
  onView,
  onEdit,
  onSendTest,
}: NotificationRouteCardProps) {
  const t = useTranslation();
  const visual = getNotificationRouteVisual(route.event.value);
  const Icon = visual.icon;
  const { recipientsCount, inAppCount, emailCount, isFallback } = getNotificationRouteCounts(
    route.recipients,
  );
  const previewRecipients = route.recipients.slice(0, 3);
  const remainingRecipients = Math.max(0, recipientsCount - previewRecipients.length);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-200",
        "hover:border-brand/30 hover:shadow-md",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl",
            visual.chipClass,
          )}
          aria-hidden="true"
        >
          <Icon className={cn("size-5", visual.iconClass)} />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <button
                type="button"
                className={cn(
                  "text-start text-base font-semibold text-foreground transition-colors",
                  canShow && onView ? "hover:text-brand" : undefined,
                )}
                onClick={canShow && onView ? () => onView(route) : undefined}
                disabled={!canShow || !onView}
              >
                {route.event.label}
              </button>
              <p className="truncate font-mono text-[11px] tracking-wide text-muted-foreground">
                {route.event.value}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isFallback ? (
                <AppBadge label={t.notificationRouteFallbackLabel} variant="warning" />
              ) : (
                <AppBadge label={t.notificationRouteConfigured} variant="brand" />
              )}
              <AppBadge
                label={`${inAppCount} ${t.notificationRouteInAppCountLabel}`}
                variant="neutral"
              />
              <AppBadge
                label={`${emailCount} ${t.notificationRouteEmailCountLabel}`}
                variant="neutral"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              {isFallback ? (
                <p className="text-sm text-muted-foreground">{t.notificationRouteFallbackHint}</p>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {previewRecipients.map((recipient) => (
                    <span
                      key={recipient.userId}
                      className="inline-flex max-w-[12rem] items-center gap-1.5 rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs text-foreground"
                    >
                      <span
                        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[10px] font-semibold text-brand"
                        aria-hidden="true"
                      >
                        {(recipient.fullName || recipient.userEmail || "?")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                      <UserLabelText
                        value={recipient.fullName || recipient.userEmail || `#${recipient.userId}`}
                        className="truncate"
                      />
                    </span>
                  ))}
                  {remainingRecipients > 0 ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      +{remainingRecipients}
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canShow && onView ? (
                <AppButton
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => onView(route)}
                >
                  <Eye className="size-3.5" aria-hidden="true" />
                  {t.viewAction}
                </AppButton>
              ) : null}
              {canUpdate && onEdit ? (
                <AppButton
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => onEdit(route)}
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  {t.editAction}
                </AppButton>
              ) : null}
              {canUpdate && onSendTest ? (
                <AppButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => onSendTest(route)}
                >
                  <FlaskConical className="size-3.5" aria-hidden="true" />
                  {t.notificationRouteSendTest}
                </AppButton>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
