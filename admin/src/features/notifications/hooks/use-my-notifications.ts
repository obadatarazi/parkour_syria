import { useCallback, useEffect, useRef, useState } from "react";

import { meNotificationsService } from "@/features/notifications/services/me-notifications.service";
import type {
  Notification,
  NotificationListResult,
} from "@/features/notifications/types/notifications.types";
import { invalidateQueryCache, useCrudMutation, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export const MY_NOTIFICATIONS_QUERY_KEY = ["me-notifications", "list"] as const;

/**
 * Delay the first bell fetch so page-critical admin requests (settings, list tables) win the
 * browser's ~6 HTTP/1.1 connections. A stalled settings download was queuing notifications for ~8s.
 */
const INITIAL_FETCH_DEFER_MS = 150;

export function useMyNotifications(limit = 10) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setEnabled(true), INITIAL_FETCH_DEFER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const query = useCrudQuery<NotificationListResult>({
    queryKey: [...MY_NOTIFICATIONS_QUERY_KEY, String(limit)],
    queryFn: (signal) =>
      meNotificationsService.list(
        {
          page: 1,
          limit,
          sort: "created_at",
          direction: "desc",
        },
        signal,
      ),
    enabled,
    staleTime: 30_000,
  });

  const refetchRef = useRef(query.refetch);
  refetchRef.current = query.refetch;

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (document.visibilityState === "hidden") return;
      void refetchRef.current();
    };

    const timer = window.setInterval(tick, 60_000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refetchRef.current();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  return query;
}

export function useMyNotificationMutations(onChanged?: () => void | Promise<void>) {
  const t = useTranslation();

  const invalidate = useCallback(async () => {
    invalidateQueryCache("me-notifications");
    invalidateQueryCache("me-notifications-center");
    await onChanged?.();
  }, [onChanged]);

  const markReadMutation = useCrudMutation({
    mutationFn: (notification: Notification) =>
      meNotificationsService.markRead(notification.id, true),
    feedback: {
      errorMessage: t.errorMessage,
    },
    onSuccess: invalidate,
  });

  const markAllReadMutation = useCrudMutation({
    mutationFn: async (_: void) => {
      await meNotificationsService.markAllRead();
    },
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.notificationsMarkedAllRead,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: invalidate,
  });

  return {
    markRead: markReadMutation.mutate,
    markAllRead: () => markAllReadMutation.mutate(undefined),
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
