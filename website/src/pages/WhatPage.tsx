import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
import { useI18n } from '@/i18n/useI18n';

type Faq = { q: string; a: string };

export function WhatPage() {
  const { navigate } = useNav();
  const { t, tm } = useI18n();
  const faqs = tm<Faq[]>('pages.what.faqs');
  const whyList = tm<string[]>('pages.what.whyList');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>{t('pages.what.heroTitle')}</h1>
          <p>{t('pages.what.heroSub')}</p>
        </div>
      </div>
      <Reveal as="section" className="section section-light">
        <div className="container-x prose">
          <div className="safety">
            <strong>{t('pages.what.safetyTitle')}</strong>
            {t('pages.what.safetyText')}
          </div>
          <p>{t('pages.what.intro')}</p>
          <h2>{t('pages.what.originTitle')}</h2>
          <p>
            {t('pages.what.originBefore')}
            <strong>{t('pages.what.originName')}</strong>
            {t('pages.what.originAfter')}
          </p>
          <p>{t('pages.what.syriaFocus')}</p>
          <h2>{t('pages.what.whyTitle')}</h2>
          <ul>
            {whyList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <h2>{t('pages.what.dangerTitle')}</h2>
          <p>{t('pages.what.dangerText')}</p>
          <h2>{t('pages.what.faqsTitle')}</h2>
          {faqs.map((f, i) => (
            <div key={i} className="border-b border-white/10">
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="py-4 font-semibold text-[0.95rem] w-full flex justify-between items-center gap-3 text-start"
              >
                {f.q}
                <ChevronDown
                  size={16}
                  className={openIdx === i ? 'rotate-180 transition-transform' : 'transition-transform'}
                />
              </button>
              {openIdx === i && (
                <p className="pb-4 text-[0.9rem] text-white/60">
                  {f.a}{' '}
                  {i === 2 && (
                    <button type="button" onClick={() => navigate('directory')} className="underline">
                      {t('pages.what.directoryLink')}
                    </button>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
