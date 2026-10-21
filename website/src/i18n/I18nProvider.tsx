import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  applyDocumentLang,
  DEFAULT_LANG,
  dirOf,
  LANG_LOCKED,
  localeOf,
  STORAGE_KEY,
  type Lang,
} from './config';
import { I18nContext, type I18nContextValue } from './context';
import {
  getByPath,
  interpolate,
  messages,
  type MessageKey,
} from './messages';

function warnMissing(key: string) {
  if (import.meta.env.DEV) {
    console.warn(`[i18n] missing key: ${key}`);
  }
}

export function I18nProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    if (LANG_LOCKED) {
      // Arabic-only: ignore switches to English (and keep storage on ar).
      next = DEFAULT_LANG;
    }
    setLangState(next);
    applyDocumentLang(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage blocked
    }
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      const raw = getByPath(messages[lang], key);
      if (typeof raw !== 'string') {
        warnMissing(key);
        return key;
      }
      return interpolate(raw, vars);
    },
    [lang]
  );

  const tm = useCallback(
    <T = unknown>(key: string): T => {
      const raw = getByPath(messages[lang], key);
      if (raw === undefined) {
        warnMissing(key);
      }
      return raw as T;
    },
    [lang]
  );

  const formatDate = useCallback(
    (iso: string, opts?: Intl.DateTimeFormatOptions) => {
      const d = new Date(iso);
      return new Intl.DateTimeFormat(localeOf(lang), {
        numberingSystem: 'latn',
        ...opts,
      }).format(d);
    },
    [lang]
  );

  const formatNumber = useCallback(
    (n: number, opts?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(localeOf(lang), {
        numberingSystem: 'latn',
        ...opts,
      }).format(n);
    },
    [lang]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      dir: dirOf(lang),
      setLang,
      t,
      tm,
      formatDate,
      formatNumber,
    }),
    [lang, setLang, t, tm, formatDate, formatNumber]
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}
