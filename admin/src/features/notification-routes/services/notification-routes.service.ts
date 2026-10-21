import type { NotificationRoutesService } from "@/features/notification-routes/services/notification-routes.service.types";
import { createApiNotificationRoutesService } from "@/features/notification-routes/services/notification-routes-api.service";

export const notificationRoutesService: NotificationRoutesService =
  createApiNotificationRoutesService();

