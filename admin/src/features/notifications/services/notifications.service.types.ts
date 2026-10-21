import type {
  Notification,
  NotificationFormData,
  NotificationListParams,
  NotificationListResult,
} from "@/features/notifications/types/notifications.types";

export interface NotificationsService {
  list(
    params?: NotificationListParams,
    signal?: AbortSignal,
  ): Promise<NotificationListResult>;
  getById(id: number, signal?: AbortSignal): Promise<Notification>;
  create(data: NotificationFormData): Promise<Notification>;
  update(id: number, data: Partial<NotificationFormData>): Promise<Notification>;
  delete(id: number): Promise<void>;
}
