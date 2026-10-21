import type { Translation } from "./en";

export type AppLanguage = "en" | "ar";

const localeCache = new Map<AppLanguage, Translation>();

export async function loadLocale(language: AppLanguage): Promise<Translation> {
  const cached = localeCache.get(language);
  if (cached) return cached;

  if (language === "ar") {
    const { ar } = await import("./ar");
    localeCache.set("ar", ar);
    return ar;
  }

  const { en } = await import("./en");
  localeCache.set("en", en);
  return en;
}

/** Warm the other language during idle time so switching feels instant. */
export function prefetchLocale(language: AppLanguage): void {
  if (localeCache.has(language)) return;
  void loadLocale(language);
}
