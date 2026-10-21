import { Eye, Info, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

import { NotificationMarkReadButton } from "@/features/notifications/components/NotificationMarkReadButton";
import type { Notification } from "@/features/notifications/types/notifications.types";
import {
  getLocalizedNotificationCopy,
  getNotificationTypeLabel,
  getNotificationVisual,
} from "@/features/notifications/utils/notification-display.utils";
import { getNotificationTargetHref } from "@/features/notifications/utils/notification-target.utils";
import { AppBadge, AppButton } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type NotificationInboxItemProps = {
  notification: Notification;
  canMarkRead?: boolean;
  canDelete?: boolean;
  isReadUpdating?: boolean;
  /** Prefer deep-link navigation when metaData has a target; otherwise opens the view. */
  navigateOnOpen?: boolean;
  onOpen: (notification: Notification) => void;
  onMarkRead?: (notification: Notification) => void;
  onDelete?: (notification: Notification) => void;
};

export function NotificationInboxItem({
  notification,
  canMarkRead = false,
  canDelete = false,
  isReadUpdating = false,
  navigateOnOpen = false,
  onOpen,
  onMarkRead,
  onDelete,
}: NotificationInboxItemProps) {
  const t = useTranslation();
  const navigate = useNavigate();
  const { language } = useLocalization();
  const copy = getLocalizedNotificationCopy(notification, language);
  const visual = getNotificationVisual(notification.type?.value);
  const Icon = visual.icon;
  const typeLabel = getNotificationTypeLabel(notification.type, language) || t.notSet;
  const isUnread = !notification.read;
  const targetHref = getNotificationTargetHref(notification);
  const canOpenRelated = Boolean(navigateOnOpen && targetHref);

  const markReadIfNeeded = () => {
    if (canMarkRead && onMarkRead && isUnread) {
      onMarkRead(notification);
    }
  };

  const handleOpenRelated = () => {
    if (!targetHref) return;
    markReadIfNeeded();
    navigate(targetHref);
  };

  const handlePrimaryOpen = () => {
    if (canOpenRelated && targetHref) {
      handleOpenRelated();
      return;
    }
    onOpen(notification);
  };

  return (
    <article
      className={cn(
        "flex gap-4 border-b border-border/50 px-4 py-4 transition-colors last:border-b-0 sm:px-5",
        canMarkRead && isUnread
          ? "bg-muted/70 hover:bg-muted"
          : "bg-background hover:bg-muted/20",
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 gap-3 text-start"
        onClick={handlePrimaryOpen}
      >
        <div
          className={cn(
            "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl",
            visual.chipClass,
          )}
          aria-hidden="true"
        >
          <Icon className={cn("size-5", visual.iconClass)} />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "text-sm",
                canMarkRead && isUnread
                  ? "font-semibold text-foreground"
                  : "font-medium text-foreground",
              )}
            >
              {copy.title || t.notifications}
            </p>
            {canMarkRead && isUnread ? (
              <span className="size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
            ) : null}
            <AppBadge label={typeLabel} variant="neutral" />
          </div>

          {copy.body ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {copy.body}
            </p>
          ) : null}

          <p className="text-xs text-muted-foreground/80">
            {formatDateTime(notification.createdAt, language)}
          </p>
        </div>
      </button>

      <div className="flex shrink-0 flex-col items-end justify-between gap-3">
        {canMarkRead && onMarkRead ? (
          <NotificationMarkReadButton
            read={notification.read}
            isLoading={isReadUpdating}
            onMarkRead={() => onMarkRead(notification)}
          />
        ) : null}

        <div className="flex items-center gap-1">
          <AppButton
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => onOpen(notification)}
            aria-label={t.notificationDetailsAction}
            title={t.notificationDetailsAction}
          >
            <Info className="size-4" aria-hidden="true" />
          </AppButton>
          {canOpenRelated ? (
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={handleOpenRelated}
              aria-label={t.openRelated}
              title={t.openRelated}
            >
              <Eye className="size-4" aria-hidden="true" />
            </AppButton>
          ) : null}
          {canDelete && onDelete ? (
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-destructive hover:text-destructive"
              onClick={() => onDelete(notification)}
              aria-label={t.deleteAction}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </AppButton>
          ) : null}
        </div>
      </div>
    </article>
  );
}
