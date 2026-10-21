export type ApiLocale = "en" | "ar";

/** In-memory UI locale so X-Locale tracks language switches without waiting on storage. */
let activeApiLocale: ApiLocale | null = null;

export function setActiveApiLocale(locale: ApiLocale): void {
  activeApiLocale = locale;
}

export function resolveApiLocale(locale?: string): ApiLocale {
  if (locale === "ar" || locale === "en") return locale;
  if (activeApiLocale === "ar" || activeApiLocale === "en") return activeApiLocale;
  try {
    const stored = localStorage.getItem("parkour-admin-language");
    if (stored === "ar" || stored === "en") {
      activeApiLocale = stored;
      return stored;
    }
  } catch {
    // localStorage may be unavailable (SSR / privacy mode)
  }
  return "ar";
}

export function getActiveApiLocale(): ApiLocale {
  return resolveApiLocale();
}
