import { createContext } from 'react';
import type { Lang } from './config';
import type { MessageKey } from './messages';

export interface I18nContextValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  tm: <T = unknown>(key: string) => T;
  formatDate: (
    iso: string,
    opts?: Intl.DateTimeFormatOptions
  ) => string;
  formatNumber: (n: number, opts?: Intl.NumberFormatOptions) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
