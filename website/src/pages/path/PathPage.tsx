import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { useNav } from '@/components/nav';
import { Container, PageHero, Safety } from '@/components/ui';
import { useDemo } from '@/data/useDemo';
import { useI18n } from '@/i18n/useI18n';

export function PathPage() {
  const { navigate } = useNav();
  const { t } = useI18n();
  const { lessons } = useDemo();

  return (
    <div>
      <PageHero title={t('pages.path.heroTitle')} description={t('pages.path.heroSub')} />
      <Reveal as="section" className="section section-light">
        <Container className="max-w-[680px]">
          <Safety title={t('pages.path.safetyTitle')}>{t('pages.path.safetyText')}</Safety>
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
                    lesson.num === 1 ? 'bg-ps-accent' : 'bg-ps-black'
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
        </Container>
      </Reveal>
    </div>
  );
}
