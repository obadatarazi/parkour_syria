import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
import { useDemo } from '@/data/useDemo';
import { useI18n } from '@/i18n/useI18n';

export function PathPage() {
  const { navigate } = useNav();
  const { t } = useI18n();
  const { lessons } = useDemo();

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>{t('pages.path.heroTitle')}</h1>
          <p>{t('pages.path.heroSub')}</p>
        </div>
      </div>
      <Reveal as="section" className="section section-light">
        <div className="container-x max-w-[680px]">
          <div className="safety">
            <strong>{t('pages.path.safetyTitle')}</strong>
            {t('pages.path.safetyText')}
          </div>
          <Reveal type="stagger" className="border-t border-white/10">
            {lessons.map((lesson) => (
              <button
                key={lesson.num}
                type="button"
                onClick={() => navigate('lesson', String(lesson.num))}
                className="flex items-center gap-4 py-[18px] border-b border-white/10 transition-colors hover:bg-white/5 w-full text-start"
              >
                <div
                  className={`w-9 h-9 flex items-center justify-center font-bold text-[0.9rem] flex-shrink-0 ${
                    lesson.num === 1 ? 'bg-[#c8102e]' : 'bg-[#0a0a0a]'
                  }`}
                  style={{ color: '#fff' }}
                >
                  {lesson.num}
                </div>
                <div className="flex-1">
                  <h3 className="text-[0.95rem] font-bold">{lesson.title}</h3>
                  <p className="text-xs text-white/50">{lesson.desc}</p>
                </div>
                <ArrowRight size={18} className="text-white/50 flip-rtl" />
              </button>
            ))}
          </Reveal>
        </div>
      </Reveal>
    </div>
  );
}
