import { useState, type FormEvent } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import {
  Button,
  Container,
  Field,
  FieldLabel,
  Input,
  PageHero,
  SafetySuccess,
  Select,
  Textarea,
} from '@/components/ui';
import { btnSize, btnVariant } from '@/components/ui/variants';
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
      <PageHero title={t('pages.suggest.heroTitle')} description={t('pages.suggest.heroSub')} />
      <Reveal as="section" className="section">
        <Container className="max-w-[520px]">
          {submitted ? (
            <SafetySuccess title={t('pages.suggest.successTitle')}>
              {t('pages.suggest.successText')}
            </SafetySuccess>
          ) : (
            <form onSubmit={handleSubmit}>
              <Field>
                <FieldLabel>
                  {t('pages.suggest.typeLabel')} *
                </FieldLabel>
                <Select required name="type" defaultValue="">
                  <option value="">{t('common.choosePlaceholder')}</option>
                  {TYPE_IDS.map((id) => (
                    <option key={id} value={id}>
                      {t(`pages.suggest.types.${id}`)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <FieldLabel>
                  {t('pages.suggest.nameLabel')} *
                </FieldLabel>
                <Input
                  type="text"
                  name="name"
                  required
                  placeholder={t('pages.suggest.namePlaceholder')}
                />
              </Field>
              <Field>
                <FieldLabel>
                  {t('pages.suggest.areaLabel')} *
                </FieldLabel>
                <Select required name="area" defaultValue="">
                  <option value="">{t('common.choosePlaceholder')}</option>
                  {areaLabels.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <FieldLabel>
                  {t('pages.suggest.descLabel')} *
                </FieldLabel>
                <Textarea
                  required
                  name="description"
                  placeholder={t('pages.suggest.descPlaceholder')}
                />
              </Field>
              <Field>
                <FieldLabel>{t('pages.suggest.contactLabel')}</FieldLabel>
                <Input
                  type="text"
                  name="contact"
                  placeholder={t('pages.suggest.contactPlaceholder')}
                />
              </Field>
              <div className="flex gap-2.5 items-start text-[0.875rem] text-white/60 mb-5">
                <input type="checkbox" id="sc" required className="mt-1 w-4 h-4 accent-ps-accent" />
                <label htmlFor="sc">{t('pages.suggest.consent')}</label>
              </div>
              <Button type="submit" variant={btnVariant.dark} size={btnSize.lg} block>
                {t('pages.suggest.submit')}
              </Button>
            </form>
          )}
        </Container>
      </Reveal>
    </div>
  );
}
