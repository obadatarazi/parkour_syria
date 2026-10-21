import type { Translation } from "@/shared/design-system/localization/locales/en";

const SETTING_TITLE_KEYS = {
  site_name: "settingTitleSiteName",
  default_locale: "settingTitleDefaultLocale",
  whatsapp_number: "settingTitleWhatsappNumber",
  whatsapp_display: "settingTitleWhatsappDisplay",
  whatsapp_book_message: "settingTitleWhatsappBookMessage",
  facebook_url: "settingTitleFacebookUrl",
  facebook_handle: "settingTitleFacebookHandle",
  instagram_url: "settingTitleInstagramUrl",
  instagram_handle: "settingTitleInstagramHandle",
  email: "settingTitleEmail",
  safety_notice_short: "settingTitleSafetyNoticeShort",
  safety_notice_directory: "settingTitleSafetyNoticeDirectory",
} as const satisfies Record<string, keyof Translation>;

const SETTING_DESCRIPTION_KEYS = {
  site_name: "settingDescSiteName",
  default_locale: "settingDescDefaultLocale",
  whatsapp_number: "settingDescWhatsappNumber",
  whatsapp_display: "settingDescWhatsappDisplay",
  whatsapp_book_message: "settingDescWhatsappBookMessage",
  facebook_url: "settingDescFacebookUrl",
  facebook_handle: "settingDescFacebookHandle",
  instagram_url: "settingDescInstagramUrl",
  instagram_handle: "settingDescInstagramHandle",
  email: "settingDescEmail",
  safety_notice_short: "settingDescSafetyNoticeShort",
  safety_notice_directory: "settingDescSafetyNoticeDirectory",
} as const satisfies Record<string, keyof Translation>;

function formatFallbackSettingLabel(settingKey: string): string {
  return settingKey
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getSettingTitle(settingKey: string, t: Translation): string {
  const key = SETTING_TITLE_KEYS[settingKey as keyof typeof SETTING_TITLE_KEYS];
  if (key) return t[key];
  return formatFallbackSettingLabel(settingKey);
}

export function getSettingDescription(
  settingKey: string,
  fallback: string | null | undefined,
  t: Translation,
): string {
  const key = SETTING_DESCRIPTION_KEYS[settingKey as keyof typeof SETTING_DESCRIPTION_KEYS];
  if (key) return t[key];
  return fallback?.trim() || formatFallbackSettingLabel(settingKey);
}

export function parseSettingBoolean(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
}
