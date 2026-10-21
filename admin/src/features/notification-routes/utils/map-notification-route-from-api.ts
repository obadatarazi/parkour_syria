import type { NotificationRouteApiRecord } from "@/features/notification-routes/services/notification-routes.service.types";
import type {
  NotificationRoute,
  NotificationRouteRecipient,
} from "@/features/notification-routes/types/notification-routes.types";

export function mapNotificationRouteRecipientFromApi(
  recipient: NotificationRouteApiRecord["recipients"][number],
): NotificationRouteRecipient {
  return {
    userId: recipient.userId,
    fullName: recipient.fullName ?? null,
    userEmail: recipient.userEmail ?? null,
    inApp: recipient.inApp,
    email: recipient.email,
  };
}

export function mapNotificationRouteFromApi(route: NotificationRouteApiRecord): NotificationRoute {
  return {
    id: route.event.value,
    event: {
      label: route.event.label,
      value: route.event.value,
    },
    recipients: route.recipients.map(mapNotificationRouteRecipientFromApi),
  };
}
