import { useNav } from '@/components/nav';
import type { PageId } from '@/data/demo';

const exploreLinks: { label: string; page: PageId }[] = [
  { label: 'ما هو الباركور', page: 'what' },
  { label: 'مسار المبتدئ', page: 'path' },
  { label: 'الدليل', page: 'directory' },
  { label: 'الفعاليات', page: 'events' },
];

const moreLinks: { label: string; page: PageId }[] = [
  { label: 'الكتاب', page: 'book' },
  { label: 'من نحن', page: 'about' },
  { label: 'تواصل', page: 'contact' },
  { label: 'إخلاء المسؤولية', page: 'disclaimer' },
];

export function Footer() {
  const { navigate } = useNav();

  return (
    <footer className="bg-[#111] text-[#999] pt-12 pb-7 mt-5 text-sm">
      <div className="container-x">
        <div className="disclaimer-strip">
          ⚠️ الباركور رياضة تحمل مخاطر. تدرب بأمان.{' '}
          <button onClick={() => navigate('disclaimer')} className="underline text-[#ccc]">
            إخلاء المسؤولية
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-9">
          <div className="md:col-span-1">
            <h4 className="text-white text-sm font-bold mb-3.5 uppercase tracking-wide">
              باركور سوريا
            </h4>
            <p>موقع عربي يساعد المهتمين بالباركور في سوريا على التعلّم بأمان.</p>
          </div>

          <div>
            <h4 className="text-white text-sm font-bold mb-3.5 uppercase tracking-wide">استكشف</h4>
            <ul className="space-y-2">
              {exploreLinks.map((l) => (
                <li key={l.page}>
                  <button onClick={() => navigate(l.page)} className="hover:text-white transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-bold mb-3.5 uppercase tracking-wide">المزيد</h4>
            <ul className="space-y-2">
              {moreLinks.map((l) => (
                <li key={l.page}>
                  <button onClick={() => navigate(l.page)} className="hover:text-white transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-bold mb-3.5 uppercase tracking-wide">تواصل</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://wa.me/963999000000" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  واتساب
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  فيسبوك
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  إنستغرام
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#333] pt-5 text-center text-xs">
          <p>© 2026 باركور سوريا · مرتبط بـ Parkour.com · parkoursyria.com</p>
        </div>
      </div>
    </footer>
  );
}
