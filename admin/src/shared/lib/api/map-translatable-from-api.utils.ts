import {
  getTitleFromApiTranslations,
  normalizeTranslationsFromApi,
  type LocaleTranslations,
} from "@/shared/lib/api/normalize-translations.utils";

export type TranslatableApiEntity<TFields extends Record<string, unknown> = { title?: string }> = {
  title?: string;
  translations?: unknown;
} & TFields;

/** Normalizes Laravel translation arrays on entities fetched by id/slug/list. */
export function mapTranslatableFromApi<
  T extends TranslatableApiEntity,
  TFields extends Record<string, unknown> = { title?: string },
>(entity: T): T {
  const normalized = normalizeTranslationsFromApi<TFields>(entity.translations);
  const title =
    (typeof entity.title === "string" ? entity.title.trim() : "") ||
    getTitleFromApiTranslations(entity.translations, "");

  return {
    ...entity,
    title,
    ...(normalized ? { translations: normalized as T["translations"] } : {}),
  };
}

export function mapTranslatableListFromApi<
  T extends TranslatableApiEntity,
  TFields extends Record<string, unknown> = { title?: string },
>(items: T[]): T[] {
  return items.map((item) => mapTranslatableFromApi<T, TFields>(item));
}

export function mapPaginatedTranslatableFromApi<
  T extends TranslatableApiEntity,
  TResult extends { data: T[] },
>(result: TResult): TResult {
  return {
    ...result,
    data: mapTranslatableListFromApi(result.data),
  };
}

export type { LocaleTranslations };
