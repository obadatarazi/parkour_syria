import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
import { useI18n } from '@/i18n/useI18n';

export function AboutPage() {
  const { navigate } = useNav();
  const { t } = useI18n();

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>{t('pages.about.heroTitle')}</h1>
        </div>
      </div>
      <Reveal as="section" className="section section-light">
        <div className="container-x prose">
          <p>
            <strong>{t('pages.about.brandStrong')}</strong>
            {t('pages.about.p1After')}
          </p>
          <p className="text-white/50 text-[0.9rem]">{t('pages.about.p2')}</p>
          <button type="button" onClick={() => navigate('contact')} className="btn btn-dark mt-4">
            {t('pages.about.contactCta')}
          </button>
        </div>
      </Reveal>
    </div>
  );
}
