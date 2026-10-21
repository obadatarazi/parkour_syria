import {
  resolveSettingGroupId,
  SETTING_GROUP_IDS,
  SETTING_GROUP_KEYS,
  type SettingGroupId,
} from "@/features/settings/constants/setting-groups";
import type { MultiTypeSetting } from "@/features/settings/types/settings.types";

export type SettingsGroup = {
  id: SettingGroupId;
  settings: MultiTypeSetting[];
};

function sortByKeyOrder(
  settings: MultiTypeSetting[],
  keyOrder: readonly string[],
): MultiTypeSetting[] {
  const order = new Map(keyOrder.map((key, index) => [key, index]));
  return [...settings].sort((a, b) => {
    const aOrder = order.get(a.settingKey) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = order.get(b.settingKey) ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });
}

export function groupSettingsByPurpose(settings: MultiTypeSetting[]): SettingsGroup[] {
  const buckets = Object.fromEntries(
    SETTING_GROUP_IDS.map((id) => [id, [] as MultiTypeSetting[]]),
  ) as Record<SettingGroupId, MultiTypeSetting[]>;

  for (const setting of settings) {
    buckets[resolveSettingGroupId(setting.settingKey)].push(setting);
  }

  return SETTING_GROUP_IDS.filter((id) => buckets[id].length > 0).map((id) => ({
    id,
    settings: id === "other" ? buckets[id] : sortByKeyOrder(buckets[id], SETTING_GROUP_KEYS[id]),
  }));
}
