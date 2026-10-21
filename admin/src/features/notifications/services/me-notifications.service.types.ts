import type {
  Notification,
  NotificationListParams,
  NotificationListResult,
} from "@/features/notifications/types/notifications.types";

export interface MeNotificationsService {
  list(
    params?: NotificationListParams,
    signal?: AbortSignal,
  ): Promise<NotificationListResult>;
  getById(id: number, signal?: AbortSignal): Promise<Notification>;
  markRead(id: number, read?: boolean): Promise<Notification>;
  markAllRead(): Promise<{ unreadCount: number }>;
}
