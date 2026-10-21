import { normalizeEnumLabelValue, type EnumLabelValue } from "@/shared/lib/api/normalize-enum.utils";

export function mapLoyaltyEnumOption(
  option: { label?: string | null; value?: string | null } | string | null | undefined,
): { label: string; value: string } | null {
  if (option == null) return null;
  if (typeof option === "string") {
    return { label: option, value: option };
  }
  const normalized = normalizeEnumLabelValue(option as EnumLabelValue);
  if (!normalized?.value) return null;
  return {
    label: normalized.label ?? normalized.value,
    value: normalized.value,
  };
}
