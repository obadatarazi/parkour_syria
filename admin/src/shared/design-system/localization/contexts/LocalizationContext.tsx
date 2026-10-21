// ═══════════════════════════════════════════════════════════════════════════════
// LOCALIZATION CONTEXT
// Manages language switching and RTL/LTR layout
// ═══════════════════════════════════════════════════════════════════════════════

import { DirectionProvider } from "@radix-ui/react-direction";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { setActiveApiLocale } from "@/shared/lib/api/api-locale";

import type { Translation } from "../locales/en";
import {
  type AppLanguage,
  loadLocale,
  prefetchLocale,
} from "../locales/load-locale";

type Language = AppLanguage;
type Direction = "ltr" | "rtl";

interface LocalizationContextType {
  language: Language;
  direction: Direction;
  t: Translation;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

function readInitialLanguage(): Language {
  const stored = localStorage.getItem("parkour-admin-language");
  return stored === "ar" || stored === "en" ? stored : "ar";
}

interface LocalizationProviderProps {
  children: ReactNode;
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const initial = readInitialLanguage();
    setActiveApiLocale(initial);
    if (typeof document !== "undefined") {
      document.documentElement.dir = initial === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = initial;
    }
    return initial;
  });
  const [t, setT] = useState<Translation | null>(null);

  const direction: Direction = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    let cancelled = false;
    void loadLocale(language).then((dict) => {
      if (!cancelled) setT(dict);
    });
    return () => {
      cancelled = true;
    };
  }, [language]);

  // Prefetch the inactive locale so language toggles stay snappy.
  useEffect(() => {
    if (!t) return;
    const other: Language = language === "en" ? "ar" : "en";
    const schedule =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(() => prefetchLocale(other))
        : window.setTimeout(() => prefetchLocale(other), 1500);
    return () => {
      if (typeof window.cancelIdleCallback === "function" && typeof schedule === "number") {
        window.cancelIdleCallback(schedule);
      } else {
        window.clearTimeout(schedule as number);
      }
    };
  }, [language, t]);

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    localStorage.setItem("parkour-admin-language", language);
    setActiveApiLocale(language);
  }, [language, direction]);

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem("parkour-admin-language", lang);
    setActiveApiLocale(lang);
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === "en" ? "ar" : "en";
      localStorage.setItem("parkour-admin-language", next);
      setActiveApiLocale(next);
      return next;
    });
  }, []);

  const value = useMemo<LocalizationContextType | null>(() => {
    if (!t) return null;
    return {
      language,
      direction,
      t,
      setLanguage,
      toggleLanguage,
    };
  }, [language, direction, t, setLanguage, toggleLanguage]);

  if (!value) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background text-muted-foreground"
        aria-busy="true"
      >
        <span className="sr-only">Loading</span>
        <div className="size-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  return (
    <LocalizationContext.Provider value={value}>
      <DirectionProvider dir={direction}>{children}</DirectionProvider>
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within LocalizationProvider");
  }
  return context;
}

export function useTranslation() {
  const { t } = useLocalization();
  return t;
}
