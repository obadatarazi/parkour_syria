export const PRODUCT_PICKER_ALL_FILTER = "all";

export function parseProductPickerFilterId(value: string): number | null {
  if (value === PRODUCT_PICKER_ALL_FILTER) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
