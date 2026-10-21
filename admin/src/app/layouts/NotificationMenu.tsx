import { Check } from "lucide-react";
import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router";

import { ROUTES } from "@/app/router/routes";
import {
  useMyNotificationMutations,
  useMyNotifications,
} from "@/features/notifications/hooks/use-my-notifications";
import {
  getLocalizedNotificationCopy,
  getNotificationVisual,
} from "@/features/notifications/utils/notification-display.utils";
import { getNotificationTargetHref } from "@/features/notifications/utils/notification-target.utils";
import { AppButton, CaptionText, CardTitleText } from "@/shared/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/design-system/components/ui/dropdown-menu";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type NotificationMenuProps = {
  trigger?: ReactNode;
};

export function NotificationMenu({ trigger }: NotificationMenuProps) {
  const t = useTranslation();
  const navigate = useNavigate();
  const { language } = useLocalization();
  const { data, isLoading, isError, refetch, patchData } = useMyNotifications(8);
  const { markRead, markAllRead, isMarkingAllRead } = useMyNotificationMutations(() =>
    refetch(),
  );

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? notifications.filter((item) => !item.read).length;

  const handleMarkRead = (id: number) => {
    const target = notifications.find((item) => item.id === id);
    if (!target || target.read) return;

    patchData((current) => ({
      ...current,
      unreadCount: Math.max(0, (current.unreadCount ?? unreadCount) - 1),
      data: current.data.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    }));
    void markRead({ ...target, read: false });
  };

  const handleOpenNotification = (id: number) => {
    const item = notifications.find((notification) => notification.id === id);
    if (!item) return;

    if (!item.read) {
      handleMarkRead(id);
    }

    const href = getNotificationTargetHref(item);
    // Prefer the related record (order, coupon, product, …). Inbox is only for
    // platform/custom messages that have no deep-link meta.
    navigate(href ?? ROUTES.admin.notifications);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          {trigger}
          {unreadCount > 0 ? (
            <span className="absolute end-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[0.5rem] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 overflow-hidden rounded-2xl p-0 shadow-2xl">
        <DropdownMenuLabel className="flex items-center justify-between border-b border-border/60 px-4 py-3 font-normal">
          <span className="text-sm font-bold text-foreground">
            {t.notifications}{" "}
            {unreadCount > 0 ? (
              <span className="text-xs font-semibold text-destructive">
                ({unreadCount} {t.unread})
              </span>
            ) : null}
          </span>
          <AppButton
            variant="ghost"
            size="sm"
            className="h-auto px-0 py-0 text-xs font-semibold text-brand"
            disabled={unreadCount === 0 || isMarkingAllRead}
            onClick={(event) => {
              event.preventDefault();
              patchData((current) => ({
                ...current,
                unreadCount: 0,
                data: current.data.map((item) => ({ ...item, read: true })),
              }));
              void markAllRead();
            }}
          >
            {t.markAllRead}
          </AppButton>
        </DropdownMenuLabel>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t.loadingMessage}
            </p>
          ) : isError ? (
            <div className="space-y-2 px-4 py-6 text-center">
              <p className="text-sm text-destructive">{t.errorStateDefaultTitle}</p>
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
              >
                {t.tryAgain}
              </AppButton>
            </div>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t.noNotifications}
            </p>
          ) : (
            notifications.map((item) => {
              const visual = getNotificationVisual(item.type?.value);
              const Icon = visual.icon;
              const isUnread = !item.read;
              const copy = getLocalizedNotificationCopy(item, language);
              return (
                <DropdownMenuItem
                  key={item.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-none px-3.5 py-3.5",
                    isUnread ? "bg-muted/70" : "bg-background",
                  )}
                  onSelect={() => handleOpenNotification(item.id)}
                >
                  <div
                    className={cn(
                      "flex size-9 flex-none items-center justify-center rounded-xl",
                      visual.chipClass,
                    )}
                  >
                    <Icon className={cn("size-4", visual.iconClass)} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitleText
                      className={cn(
                        "text-xs",
                        isUnread ? "font-semibold text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {copy.title || t.notifications}
                    </CardTitleText>
                    {copy.body ? (
                      <CaptionText className="mt-0.5 line-clamp-2 text-xs">
                        {copy.body}
                      </CaptionText>
                    ) : null}
                    <CaptionText className="mt-1 text-xs">
                      {formatDateTime(item.createdAt, language)}
                    </CaptionText>
                  </div>
                  {isUnread ? (
                    <button
                      type="button"
                      className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-brand hover:bg-brand/10"
                      aria-label={t.markRead}
                      title={t.markRead}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleMarkRead(item.id);
                      }}
                    >
                      <Check className="size-4" aria-hidden="true" />
                    </button>
                  ) : (
                    <span
                      className="mt-0.5 flex size-7 shrink-0 items-center justify-center text-muted-foreground"
                      aria-label={t.read}
                    >
                      <Check className="size-4" aria-hidden="true" />
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem
          className="justify-center rounded-none py-3 text-center text-xs font-semibold text-brand"
          asChild
        >
          <Link to={ROUTES.admin.notifications}>{t.viewAll}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
