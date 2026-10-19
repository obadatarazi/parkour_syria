import { Reveal } from '@/components/Reveal';
import { useI18n } from '@/i18n/useI18n';

export function DisclaimerPage() {
  const { t, tm } = useI18n();
  const safetyPolicyList = tm<string[]>('pages.disclaimer.safetyPolicyList');

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>{t('pages.disclaimer.heroTitle')}</h1>
        </div>
      </div>
      <Reveal as="section" className="section section-light">
        <div className="container-x prose">
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
        </div>
      </Reveal>
    </div>
  );
}
