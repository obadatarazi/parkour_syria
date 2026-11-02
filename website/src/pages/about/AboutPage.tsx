import { Reveal } from '@/components/motion/Reveal';
import { useNav } from '@/components/nav';
import { Button, Container, PageHero } from '@/components/ui';
import { useI18n } from '@/i18n/useI18n';

export function AboutPage() {
  const { navigate } = useNav();
  const { t } = useI18n();

  return (
    <div>
      <PageHero title={t('pages.about.heroTitle')} />
      <Reveal as="section" className="section section-light">
        <Container className="prose">
          <p>
            <strong>{t('pages.about.brandStrong')}</strong>
            {t('pages.about.p1After')}
          </p>
          <p className="text-white/50 text-[0.9rem]">{t('pages.about.p2')}</p>
          <Button type="button" onClick={() => navigate('contact')} className="mt-4">
            {t('pages.about.contactCta')}
          </Button>
        </Container>
      </Reveal>
    </div>
  );
}
