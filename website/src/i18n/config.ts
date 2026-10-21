export type Lang = 'ar' | 'en';

export const DEFAULT_LANG: Lang = 'ar';
export const STORAGE_KEY = 'ps-lang';

/**
 * When true, the site is Arabic-only: ignore localStorage, ignore setLang('en').
 * Flip to false (and optionally SHOW_LANG_TOGGLE) to re-enable English for testing.
 */
export const LANG_LOCKED = true;

/** TEMP: language toggle for testing — set false or remove LanguageToggle to hide */
export const SHOW_LANG_TOGGLE = false;

export function dirOf(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/** Locale tags force Latin digits (0-9) in both languages. */
export function localeOf(lang: Lang): string {
  return lang === 'ar' ? 'ar-SY-u-nu-latn' : 'en-GB-u-nu-latn';
}

export function readStoredLang(): Lang {
  if (LANG_LOCKED) {
    try {
      // Clear a leftover English preference from earlier testing.
      if (localStorage.getItem(STORAGE_KEY) === 'en') {
        localStorage.setItem(STORAGE_KEY, DEFAULT_LANG);
      }
    } catch {
      // storage blocked
    }
    return DEFAULT_LANG;
  }

  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'ar' || v === 'en') return v;
  } catch {
    // storage blocked
  }
  return DEFAULT_LANG;
}

export function applyDocumentLang(lang: Lang) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = dirOf(lang);
}
