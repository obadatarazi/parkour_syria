import { hasFormChanges } from "@/shared/lib/form/pick-changed-fields";

export type NotificationRouteEvent = {
  label: string;
  value: string;
};

export type NotificationRouteRecipient = {
  userId: number;
  fullName: string | null;
  userEmail: string | null;
  inApp: boolean;
  email: boolean;
};

export type NotificationRoute = {
  id: string;
  event: NotificationRouteEvent;
  recipients: NotificationRouteRecipient[];
};

export type NotificationRouteFormRecipient = {
  userId: number;
  inApp: boolean;
  email: boolean;
};

export type NotificationRouteFormData = {
  recipients: NotificationRouteFormRecipient[];
};

export function createEmptyNotificationRouteForm(): NotificationRouteFormData {
  return {
    recipients: [],
  };
}

export function notificationRouteToFormData(entity: NotificationRoute): NotificationRouteFormData {
  return {
    recipients: entity.recipients.map((recipient) => ({
      userId: recipient.userId,
      inApp: recipient.inApp,
      email: recipient.email,
    })),
  };
}

function normalizeRecipients(recipients: NotificationRouteFormRecipient[]) {
  return [...recipients]
    .map((recipient) => ({
      userId: recipient.userId,
      inApp: recipient.inApp,
      email: recipient.email,
    }))
    .sort((left, right) => left.userId - right.userId);
}

export function pickNotificationRouteFormChanges(
  original: NotificationRouteFormData,
  current: NotificationRouteFormData,
): Partial<NotificationRouteFormData> {
  const originalRecipients = normalizeRecipients(original.recipients);
  const currentRecipients = normalizeRecipients(current.recipients);

  const recipientsChanged =
    originalRecipients.length !== currentRecipients.length ||
    originalRecipients.some((recipient, index) => {
      const currentRecipient = currentRecipients[index];
      return (
        recipient.userId !== currentRecipient.userId ||
        recipient.inApp !== currentRecipient.inApp ||
        recipient.email !== currentRecipient.email
      );
    });

  if (!recipientsChanged) {
    return {};
  }

  return {
    recipients: current.recipients.map((recipient) => ({
      userId: recipient.userId,
      inApp: recipient.inApp,
      email: recipient.email,
    })),
  };
}

export function hasNotificationRouteFormChanges(
  original: NotificationRouteFormData,
  current: NotificationRouteFormData,
): boolean {
  return hasFormChanges(pickNotificationRouteFormChanges(original, current));
}
