export const SETTING_GROUP_IDS = ["site", "whatsapp", "social", "safety", "other"] as const;

export type SettingGroupId = (typeof SETTING_GROUP_IDS)[number];

/**
 * The keys the public site reads (backend `config/site.php` public_settings), grouped by purpose and
 * listed in display order. Anything else falls into "other".
 */
export const SETTING_GROUP_KEYS: Record<Exclude<SettingGroupId, "other">, readonly string[]> = {
  site: ["site_name", "default_locale"],
  whatsapp: ["whatsapp_number", "whatsapp_display", "whatsapp_book_message"],
  social: ["facebook_url", "facebook_handle", "instagram_url", "instagram_handle", "email"],
  safety: ["safety_notice_short", "safety_notice_directory"],
};

const SETTING_KEY_GROUP_MAP: Record<string, SettingGroupId> = Object.fromEntries(
  Object.entries(SETTING_GROUP_KEYS).flatMap(([groupId, keys]) =>
    keys.map((key) => [key, groupId as SettingGroupId]),
  ),
);

export function resolveSettingGroupId(settingKey: string): SettingGroupId {
  return SETTING_KEY_GROUP_MAP[settingKey] ?? "other";
}
