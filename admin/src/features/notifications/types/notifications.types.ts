import type { LocaleCode } from "@/shared/lib/api/form-data.utils";
import type { EnumLabelValue } from "@/shared/lib/api/normalize-enum.utils";
import {
  areNumberArraysEqual,
  hasFormChanges,
  normalizedStringEqual,
  pickChangedScalar,
} from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type NotificationTypeValue =
  | "ORDER"
  | "STOCK"
  | "RX"
  | "CUSTOMER"
  | "PAYMENT"
  | "PROMO"
  | "REVIEW"
  | "LOYALTY"
  | "CUSTOM"
  | "WARNING"
  | "ERROR";

export type NotificationTranslation = {
  title: string;
  body: string;
};

export type NotificationTranslations = Partial<Record<LocaleCode, NotificationTranslation>>;

export type NotificationUserRef = {
  id: number;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  type?: EnumLabelValue | string | null;
};

export type Notification = {
  id: number;
  read: boolean;
  type: EnumLabelValue;
  title: string;
  body?: string | null;
  translations?: NotificationTranslations;
  metaData?: Record<string, unknown> | null;
  users?: NotificationUserRef[];
  createdAt?: string;
  updatedAt?: string;
};

export type NotificationListParams = {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: NotificationTypeValue;
  userId?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export type NotificationFormData = {
  type: NotificationTypeValue | "";
  read?: boolean;
  userIds: number[];
  translations: NotificationTranslations;
};

export type NotificationListResult = PaginatedResult<Notification>;

export function createEmptyNotificationForm(): NotificationFormData {
  return {
    type: "CUSTOM",
    read: false,
    userIds: [],
    translations: {
      en: { title: "", body: "" },
      ar: { title: "", body: "" },
    },
  };
}

export function notificationToFormData(entity: Notification): NotificationFormData {
  const typeValue = (entity.type?.value ?? "CUSTOM") as NotificationTypeValue;
  return {
    type: typeValue,
    read: entity.read,
    userIds: (entity.users ?? []).map((user) => user.id),
    translations: {
      en: {
        title: entity.translations?.en?.title ?? "",
        body: entity.translations?.en?.body ?? "",
      },
      ar: {
        title: entity.translations?.ar?.title ?? "",
        body: entity.translations?.ar?.body ?? "",
      },
    },
  };
}

function pickChangedNotificationTranslations(
  original: NotificationTranslations,
  current: NotificationTranslations,
): NotificationTranslations | undefined {
  const locales = new Set([
    ...Object.keys(original),
    ...Object.keys(current),
  ]) as Set<LocaleCode>;

  const changed: NotificationTranslations = {};
  let hasChanges = false;

  for (const locale of locales) {
    const originalTranslation = original[locale];
    const currentTranslation = current[locale];
    const titleChanged = !normalizedStringEqual(
      originalTranslation?.title,
      currentTranslation?.title,
    );
    const bodyChanged = !normalizedStringEqual(
      originalTranslation?.body,
      currentTranslation?.body,
    );

    if (!titleChanged && !bodyChanged) continue;

    hasChanges = true;
    changed[locale] = {
      title: currentTranslation?.title?.trim() ?? "",
      body: currentTranslation?.body?.trim() ?? "",
    };
  }

  return hasChanges ? changed : undefined;
}

export function pickNotificationFormChanges(
  original: NotificationFormData,
  current: NotificationFormData,
): Partial<NotificationFormData> {
  const changes: Partial<NotificationFormData> = {
    ...pickChangedScalar(original, current, ["type", "read"]),
  };

  if (!areNumberArraysEqual(original.userIds, current.userIds)) {
    changes.userIds = current.userIds;
  }

  const translationChanges = pickChangedNotificationTranslations(
    original.translations,
    current.translations,
  );
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  return changes;
}

export function hasNotificationFormChanges(
  original: NotificationFormData,
  current: NotificationFormData,
): boolean {
  return hasFormChanges(pickNotificationFormChanges(original, current));
}
