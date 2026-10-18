import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
import { lessons } from '@/data/demo';

export function LessonPage() {
  const { navigate, id } = useNav();
  const lesson = lessons.find((l) => String(l.num) === id) ?? lessons[0];
  const next = lessons.find((l) => l.num === lesson.num + 1);

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <button onClick={() => navigate('path')} className="back-link">
            → العودة للمسار
          </button>
          <h1>الدرس {lesson.num}: {lesson.title}</h1>
          <p>{lesson.desc}</p>
        </div>
      </div>
      <Reveal as="section" className="section section-light">
        <div className="container-x prose">
          <div className="safety">
            <strong>تنبيه</strong>درس نظري وعملي خفيف. لا تحاول حركات متقدمة.
          </div>
          {!lesson.body && <p>محتوى هذا الدرس قريباً.</p>}
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
            <button onClick={() => navigate('path')} className="btn btn-outline">
              → العودة
            </button>
            {next && (
              <button onClick={() => navigate('lesson', String(next.num))} className="btn btn-dark">
                الدرس التالي ←
              </button>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
