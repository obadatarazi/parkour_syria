import type { Notification } from "@/features/notifications/types/notifications.types";
import { normalizeNotificationMeta } from "@/features/notifications/utils/notification-target.utils";
import { normalizeEnumLabelValue } from "@/shared/lib/api/normalize-enum.utils";
import { normalizeTranslationsFromApi } from "@/shared/lib/api/normalize-translations.utils";

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

export function mapNotificationFromApi(entity: Notification): Notification {
  const translations = normalizeTranslationsFromApi<{ title?: string; body?: string }>(
    entity.translations,
  );
  const apiTitle = typeof entity.title === "string" ? entity.title : "";
  const apiBody = typeof entity.body === "string" ? entity.body : "";
  const title = firstNonEmpty(apiTitle, translations?.en?.title, translations?.ar?.title);
  const body =
    firstNonEmpty(apiBody, translations?.en?.body, translations?.ar?.body) || null;

  return {
    ...entity,
    title,
    body,
    read: Boolean(entity.read),
    type: normalizeEnumLabelValue(entity.type) ?? { label: null, value: null },
    translations: translations
      ? {
          en: {
            title: translations.en?.title ?? "",
            body: translations.en?.body ?? "",
          },
          ar: {
            title: translations.ar?.title ?? "",
            body: translations.ar?.body ?? "",
          },
        }
      : entity.translations,
    users: Array.isArray(entity.users) ? entity.users : [],
    metaData: normalizeNotificationMeta(entity.metaData),
  };
}
