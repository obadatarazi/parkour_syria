import { useLink } from '@/components/nav';
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
  const link = useLink();

  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10">
      <div className="container-x">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="font-extrabold text-xl text-white flex items-center gap-2.5 mb-4">
              <span className="bg-white text-black w-8 h-8 flex items-center justify-center font-extrabold text-sm">
                ب
              </span>
              باركور سوريا
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              موقع عربي يساعد المهتمين بالباركور في سوريا على التعلّم بأمان.
            </p>
          </div>

          <div>
            <h4 className="text-white/30 text-xs font-bold mb-5 uppercase tracking-[0.15em]">
              استكشف
            </h4>
            <ul className="space-y-3">
              {exploreLinks.map((l) => (
                <li key={l.page}>
                  <a
                    {...link(l.page)}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white/30 text-xs font-bold mb-5 uppercase tracking-[0.15em]">
              المزيد
            </h4>
            <ul className="space-y-3">
              {moreLinks.map((l) => (
                <li key={l.page}>
                  <a
                    {...link(l.page)}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white/30 text-xs font-bold mb-5 uppercase tracking-[0.15em]">
              تواصل
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/963999000000"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  واتساب
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  فيسبوك
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  إنستغرام
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">
            © 2026 باركور سوريا · مرتبط بـ Parkour.com · parkoursyria.com
          </p>
          <p className="text-white/20 text-xs uppercase tracking-widest">
            تدرب بأمان
          </p>
        </div>
      </div>
    </footer>
  );
}
