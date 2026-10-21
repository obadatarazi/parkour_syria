import type { LocaleCode, TranslationsInput } from "@/shared/lib/api/form-data.utils";

export function normalizedStringEqual(
  a: string | undefined | null,
  b: string | undefined | null,
): boolean {
  return (a ?? "").trim() === (b ?? "").trim();
}

export function areNumberArraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((left, right) => left - right);
  const sortedB = [...b].sort((left, right) => left - right);
  return sortedA.every((value, index) => value === sortedB[index]);
}

export function pickChangedTranslations(
  original: TranslationsInput,
  current: TranslationsInput,
): TranslationsInput | undefined {
  const locales = new Set([
    ...Object.keys(original),
    ...Object.keys(current),
  ]) as Set<LocaleCode>;

  const changed: TranslationsInput = {};
  let hasChanges = false;

  for (const locale of locales) {
    const originalTranslation = original[locale];
    const currentTranslation = current[locale];
    const titleChanged = !normalizedStringEqual(
      originalTranslation?.title,
      currentTranslation?.title,
    );
    const descriptionChanged = !normalizedStringEqual(
      originalTranslation?.description,
      currentTranslation?.description,
    );

    if (!titleChanged && !descriptionChanged) continue;

    hasChanges = true;
    changed[locale] = {
      title: currentTranslation?.title?.trim() ?? "",
      description: currentTranslation?.description?.trim() ?? "",
    };
  }

  return hasChanges ? changed : undefined;
}

export function pickChangedScalar<T extends Record<string, unknown>>(
  original: T,
  current: T,
  keys: (keyof T)[],
  compare: (key: keyof T, originalValue: unknown, currentValue: unknown) => boolean = (
    _key,
    originalValue,
    currentValue,
  ) => originalValue !== currentValue,
): Partial<T> {
  const changed: Partial<T> = {};

  for (const key of keys) {
    if (compare(key, original[key], current[key])) {
      changed[key] = current[key];
    }
  }

  return changed;
}

export function hasFormChanges<T extends Record<string, unknown>>(changes: Partial<T>): boolean {
  return Object.keys(changes).length > 0;
}
