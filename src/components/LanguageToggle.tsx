import { SHOW_LANG_TOGGLE } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';

/** TEMP: language toggle for testing — remove this file and its Header mount to hide */
export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();

  if (!SHOW_LANG_TOGGLE) return null;

  const next = lang === 'ar' ? 'en' : 'ar';

  return (
    <button
      type="button"
      lang={next}
      className="filter-btn !py-1.5 !px-3 text-xs"
      aria-label={t('toggle.ariaLabel')}
      onClick={() => setLang(next)}
    >
      {t('toggle.switchTo')}
    </button>
  );
}
