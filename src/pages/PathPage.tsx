import { ArrowLeft } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
import { lessons } from '@/data/demo';

export function PathPage() {
  const { navigate } = useNav();

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>مسار المبتدئ</h1>
          <p>ابدأ من الأمان، ثم الأساسيات</p>
        </div>
      </div>
      <Reveal as="section" className="section">
        <div className="container-x max-w-[680px]">
          <div className="safety">
            <strong>الأمان أولاً</strong>الدرس الأول إلزامي. لا تنتقل للتالي قبل فهم القواعد.
          </div>
          <Reveal type="stagger" className="border-t border-[#e5e5e5]">
            {lessons.map((lesson) => (
              <button
                key={lesson.num}
                onClick={() => navigate('lesson')}
                className="flex items-center gap-4 py-[18px] border-b border-[#e5e5e5] transition-colors hover:bg-[#f5f5f5] w-full text-right"
              >
                <div
                  className={`w-9 h-9 flex items-center justify-center font-bold text-[0.9rem] flex-shrink-0 text-white ${
                    lesson.num === 1 ? 'bg-[#c8102e]' : 'bg-[#111]'
                  }`}
                >
                  {lesson.num}
                </div>
                <div className="flex-1">
                  <h3 className="text-[0.95rem] font-bold">{lesson.title}</h3>
                  <p className="text-xs text-[#888]">{lesson.desc}</p>
                </div>
                <ArrowLeft size={18} className="text-[#888]" />
              </button>
            ))}
          </Reveal>
        </div>
      </Reveal>
    </div>
  );
}
