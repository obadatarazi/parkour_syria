export type MultiTypeSettingType =
  | "EMAIL"
  | "LINK"
  | "NUMBER"
  | "PHONE_NUMBER"
  | "TEXT"
  | "PERCENTAGE"
  | "BOOLEAN";

export type MultiTypeSetting = {
  id: number;
  settingKey: string;
  value: string;
  type: MultiTypeSettingType;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MultiTypeSettingListParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: MultiTypeSettingType;
  sort?: string;
  direction?: "asc" | "desc";
};

export type MultiTypeSettingFormData = {
  settingKey: string;
  value: string;
  type: MultiTypeSettingType;
  description?: string;
};

export type MultiTypeSettingUpdateInput = {
  value?: string;
  type?: MultiTypeSettingType;
  description?: string;
};

export function createEmptySettingForm(): MultiTypeSettingFormData {
  return {
    settingKey: "",
    value: "",
    type: "TEXT",
    description: "",
  };
}

export function settingToFormData(setting: MultiTypeSetting): MultiTypeSettingFormData {
  return {
    settingKey: setting.settingKey,
    value: setting.value,
    type: setting.type,
    description: setting.description ?? "",
  };
}

export function pickSettingFormChanges(
  original: MultiTypeSettingFormData,
  current: MultiTypeSettingFormData,
): Partial<MultiTypeSettingFormData> {
  const changes: Partial<MultiTypeSettingFormData> = {};

  // Edit mode only persists value changes (type / description stay fixed).
  if (original.value !== current.value) changes.value = current.value;

  return changes;
}

export function hasSettingFormChanges(
  original: MultiTypeSettingFormData,
  current: MultiTypeSettingFormData,
): boolean {
  return Object.keys(pickSettingFormChanges(original, current)).length > 0;
}
