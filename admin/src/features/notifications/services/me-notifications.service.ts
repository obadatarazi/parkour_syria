import type { MeNotificationsService } from "@/features/notifications/services/me-notifications.service.types";
import { createApiMeNotificationsService } from "@/features/notifications/services/me-notifications-api.service";

export const meNotificationsService: MeNotificationsService =
  createApiMeNotificationsService();
