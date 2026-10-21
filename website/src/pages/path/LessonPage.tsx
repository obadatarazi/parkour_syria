import { ArrowRight, ChevronLeft } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { useNav } from '@/components/nav';
import { BackButton, Button, Container, PageHero, Safety } from '@/components/ui';
import { btnVariant } from '@/components/ui/variants';
import { useDemo } from '@/data/useDemo';
import { useI18n } from '@/i18n/useI18n';

export function LessonPage() {
  const { navigate, id } = useNav();
  const { t } = useI18n();
  const { lessons } = useDemo();
  const lesson = lessons.find((l) => String(l.num) === id) ?? lessons[0];
  const next = lessons.find((l) => l.num === lesson.num + 1);

  return (
    <div>
      <PageHero>
        <BackButton type="button" onClick={() => navigate('path')}>
          <ChevronLeft size={16} className="flip-rtl" />
          {t('pages.lesson.back')}
        </BackButton>
        <h1>{t('pages.lesson.heading', { num: lesson.num, title: lesson.title })}</h1>
        <p>{lesson.desc}</p>
      </PageHero>
      <Reveal as="section" className="section section-light">
        <Container className="prose">
          <Safety title={t('pages.lesson.safetyTitle')}>{t('pages.lesson.safetyText')}</Safety>
          {!lesson.body && <p>{t('pages.lesson.comingSoon')}</p>}
          {lesson.body?.map((section, i) => (
            <div key={i}>
              <h2>{section.heading}</h2>
              {section.text && <p>{section.text}</p>}
              {section.list && (
                <ul>
                  {section.list.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <div className="flex gap-3 flex-wrap mt-7">
            <Button
              type="button"
              variant={btnVariant.outline}
              onClick={() => navigate('path')}
              className="inline-flex items-center gap-1.5"
            >
              <ChevronLeft size={16} className="flip-rtl" />
              {t('common.back')}
            </Button>
            {next && (
              <Button
                type="button"
                variant={btnVariant.dark}
                onClick={() => navigate('lesson', String(next.num))}
                className="inline-flex items-center gap-1.5"
              >
                {t('pages.lesson.next')}
                <ArrowRight size={16} className="flip-rtl" />
              </Button>
            )}
          </div>
        </Container>
      </Reveal>
    </div>
  );
}
