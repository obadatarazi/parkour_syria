import type { NotificationsService } from "@/features/notifications/services/notifications.service.types";
import { createApiNotificationsService } from "@/features/notifications/services/notifications-api.service";

export const notificationsService: NotificationsService = createApiNotificationsService();
