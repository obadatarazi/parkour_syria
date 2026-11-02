import { Reveal } from '@/components/motion/Reveal';
import { Container, PageHero } from '@/components/ui';
import { useI18n } from '@/i18n/useI18n';

export function DisclaimerPage() {
  const { t, tm } = useI18n();
  const safetyPolicyList = tm<string[]>('pages.disclaimer.safetyPolicyList');

  return (
    <div>
      <PageHero title={t('pages.disclaimer.heroTitle')} />
      <Reveal as="section" className="section section-light">
        <Container className="prose">
          <h2>{t('pages.disclaimer.disclaimerTitle')}</h2>
          <p>{t('pages.disclaimer.disclaimerText')}</p>
          <h2>{t('pages.disclaimer.safetyPolicyTitle')}</h2>
          <ul>
            {safetyPolicyList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <h2>{t('pages.disclaimer.affiliationTitle')}</h2>
          <p>{t('pages.disclaimer.affiliationText')}</p>
        </Container>
      </Reveal>
    </div>
  );
}
