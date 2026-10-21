// ═══════════════════════════════════════════════════════════════════════════════
// LANGUAGE SWITCHER COMPONENT
// Toggle between English and Arabic with RTL support
// ═══════════════════════════════════════════════════════════════════════════════

import { Globe } from "lucide-react";

import { useLocalization, useTranslation } from "../localization/contexts/LocalizationContext";

interface LanguageSwitcherProps {
  variant?: "header" | "minimal";
  showText?: boolean;
}

export function LanguageSwitcher({ variant = "header", showText = true }: LanguageSwitcherProps) {
  const { language, toggleLanguage } = useLocalization();
  const t = useTranslation();
  const localeCode = language === "en" ? "EN" : "AR";
  const flag = language === "en" ? "🇬🇧" : "🇰🇼";

  if (variant === "minimal") {
    return (
      <button
        onClick={toggleLanguage}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-2.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted"
        aria-label={t.languageSwitchAria}
      >
        <span aria-hidden="true">{flag}</span>
        <span>{localeCode}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-brand hover:bg-brand-muted transition-all duration-200"
      aria-label={t.languageSwitchAria}
    >
      <Globe className="w-5 h-5 text-brand" />
      {showText && (
        <span className="text-sm font-semibold text-gray-700">
          <span aria-hidden="true">{flag}</span> {localeCode} · {t.languageName}
        </span>
      )}
    </button>
  );
}
