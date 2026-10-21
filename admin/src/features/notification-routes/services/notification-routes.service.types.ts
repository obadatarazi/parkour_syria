import type {
  NotificationRoute,
  NotificationRouteFormData,
} from "@/features/notification-routes/types/notification-routes.types";

export type NotificationRouteApiEvent = {
  label: string;
  value: string;
};

export type NotificationRouteApiRecipient = {
  userId: number;
  fullName: string | null;
  userEmail: string | null;
  inApp: boolean;
  email: boolean;
};

export type NotificationRouteApiRecord = {
  event: NotificationRouteApiEvent;
  recipients: NotificationRouteApiRecipient[];
};

export type NotificationRouteUpdatePayload = NotificationRouteFormData;

export type NotificationRouteTestResult = {
  event: string;
  inAppCount: number;
  emailCount: number;
};

export interface NotificationRoutesService {
  list(signal?: AbortSignal): Promise<NotificationRoute[]>;
  update(event: string, data: NotificationRouteUpdatePayload): Promise<NotificationRoute>;
  sendTest(event: string): Promise<NotificationRouteTestResult>;
}
