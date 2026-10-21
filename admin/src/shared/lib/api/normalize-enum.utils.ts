/** Normalizes API enum fields that may be a bare string (List) or `{ label, value }` (Details). */

export type EnumLabelValue = {
  label: string | null;
  value: string | null;
};

export function normalizeEnumLabelValue(
  input: string | EnumLabelValue | null | undefined,
): EnumLabelValue | null {
  if (input == null || input === "") return null;
  if (typeof input === "string") {
    return { value: input, label: input };
  }
  if (typeof input === "object" && ("value" in input || "label" in input)) {
    return {
      value: input.value ?? null,
      label: input.label ?? input.value ?? null,
    };
  }
  return null;
}

export function enumValue(
  input: string | EnumLabelValue | null | undefined,
): string | null {
  return normalizeEnumLabelValue(input)?.value ?? null;
}

export function enumLabel(
  input: string | EnumLabelValue | null | undefined,
): string | null {
  const normalized = normalizeEnumLabelValue(input);
  return normalized?.label || normalized?.value || null;
}
