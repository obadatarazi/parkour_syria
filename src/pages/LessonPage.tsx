import { ArrowRight, ChevronLeft } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
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
      <div className="page-hero">
        <div className="container-x">
          <button
            type="button"
            onClick={() => navigate('path')}
            className="back-link inline-flex items-center gap-1.5"
          >
            <ChevronLeft size={16} className="flip-rtl" />
            {t('pages.lesson.back')}
          </button>
          <h1>
            {t('pages.lesson.heading', { num: lesson.num, title: lesson.title })}
          </h1>
          <p>{lesson.desc}</p>
        </div>
      </div>
      <Reveal as="section" className="section section-light">
        <div className="container-x prose">
          <div className="safety">
            <strong>{t('pages.lesson.safetyTitle')}</strong>
            {t('pages.lesson.safetyText')}
          </div>
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
            <button type="button" onClick={() => navigate('path')} className="btn btn-outline inline-flex items-center gap-1.5">
              <ChevronLeft size={16} className="flip-rtl" />
              {t('common.back')}
            </button>
            {next && (
              <button
                type="button"
                onClick={() => navigate('lesson', String(next.num))}
                className="btn btn-dark inline-flex items-center gap-1.5"
              >
                {t('pages.lesson.next')}
                <ArrowRight size={16} className="flip-rtl" />
              </button>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
