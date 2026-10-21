// The pages are not re-exported: the router loads them lazily (app/router/lazy-pages.ts), and a
// static export here would pull them into the header's chunk.
export { useMyNotificationMutations, useMyNotifications } from "@/features/notifications/hooks/use-my-notifications";
export { getLocalizedNotificationCopy, getNotificationVisual } from "@/features/notifications/utils/notification-display.utils";
export { getNotificationTargetHref } from "@/features/notifications/utils/notification-target.utils";
