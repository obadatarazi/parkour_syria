import { useState, type FormEvent } from 'react';
import { Reveal } from '@/components/Reveal';
import { useDemo } from '@/data/useDemo';
import { useI18n } from '@/i18n/useI18n';

const TYPE_IDS = ['place', 'coach', 'team', 'event'] as const;

export function SuggestPage() {
  const { t } = useI18n();
  const { areaLabels } = useDemo();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>{t('pages.suggest.heroTitle')}</h1>
          <p>{t('pages.suggest.heroSub')}</p>
        </div>
      </div>
      <Reveal as="section" className="section">
        <div className="container-x max-w-[520px]">
          {submitted ? (
            <div className="safety-success">
              <strong>{t('pages.suggest.successTitle')}</strong>
              {t('pages.suggest.successText')}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-semibold text-[0.85rem] mb-1.5">
                  {t('pages.suggest.typeLabel')} *
                </label>
                <select
                  required
                  name="type"
                  className="w-full p-3 border border-white/10 text-[0.9rem] outline-none focus:border-white/40 bg-[#121212]"
                >
                  <option value="">{t('common.choosePlaceholder')}</option>
                  {TYPE_IDS.map((id) => (
                    <option key={id} value={id}>
                      {t(`pages.suggest.types.${id}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-semibold text-[0.85rem] mb-1.5">
                  {t('pages.suggest.nameLabel')} *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={t('pages.suggest.namePlaceholder')}
                  className="w-full p-3 border border-white/10 text-[0.9rem] outline-none focus:border-white/40 bg-[#121212]"
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold text-[0.85rem] mb-1.5">
                  {t('pages.suggest.areaLabel')} *
                </label>
                <select
                  required
                  name="area"
                  className="w-full p-3 border border-white/10 text-[0.9rem] outline-none focus:border-white/40 bg-[#121212]"
                >
                  <option value="">{t('common.choosePlaceholder')}</option>
                  {areaLabels.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-semibold text-[0.85rem] mb-1.5">
                  {t('pages.suggest.descLabel')} *
                </label>
                <textarea
                  required
                  name="description"
                  placeholder={t('pages.suggest.descPlaceholder')}
                  className="w-full p-3 border border-white/10 text-[0.9rem] outline-none focus:border-white/40 bg-[#121212] min-h-[100px] resize-y"
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold text-[0.85rem] mb-1.5">
                  {t('pages.suggest.contactLabel')}
                </label>
                <input
                  type="text"
                  name="contact"
                  placeholder={t('pages.suggest.contactPlaceholder')}
                  className="w-full p-3 border border-white/10 text-[0.9rem] outline-none focus:border-white/40 bg-[#121212]"
                />
              </div>
              <div className="flex gap-2.5 items-start text-[0.875rem] text-white/60 mb-5">
                <input type="checkbox" id="sc" required className="mt-1 w-4 h-4 accent-[#c8102e]" />
                <label htmlFor="sc">{t('pages.suggest.consent')}</label>
              </div>
              <button type="submit" className="btn btn-dark btn-lg btn-block">
                {t('pages.suggest.submit')}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </div>
  );
}
