import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNav } from '@/components/nav';
import { navLinks, type PageId } from '@/data/demo';

const extraLinks: { label: string; page: PageId }[] = [
  { label: 'اقترح إضافة', page: 'suggest' },
  { label: 'من نحن', page: 'about' },
  { label: 'تواصل معنا', page: 'contact' },
  { label: 'إخلاء المسؤولية', page: 'disclaimer' },
];

export function Header() {
  const { page, navigate } = useNav();
  const [open, setOpen] = useState(false);

  const go = (p: PageId) => {
    navigate(p);
    setOpen(false);
  };

  return (
    <>
      <div className="bg-[#111] text-white text-xs py-2 text-center">
        <button onClick={() => go('about')} className="text-gray-300 hover:text-white mx-3">
          من نحن
        </button>
        <button onClick={() => go('contact')} className="text-gray-300 hover:text-white mx-3">
          تواصل
        </button>
        <button onClick={() => go('disclaimer')} className="text-gray-300 hover:text-white mx-3">
          إخلاء المسؤولية
        </button>
      </div>

      <header className="sticky top-0 z-[100] bg-white border-b border-[#e5e5e5]">
        <div className="container-x flex items-center justify-between h-16 gap-4">
          <button
            onClick={() => go('home')}
            className="font-extrabold text-lg sm:text-xl tracking-tight flex items-center gap-2.5"
          >
            <span className="bg-[#111] text-white w-9 h-9 flex items-center justify-center font-extrabold text-base flex-shrink-0">
              ب
            </span>
            <span className="hidden xs:inline sm:inline">باركور سوريا</span>
            <span className="xs:hidden sm:hidden">باركور</span>
          </button>

          <nav className="hidden md:flex gap-7 text-sm font-medium">
            {navLinks.map((l) => (
              <button
                key={l.page}
                onClick={() => go(l.page)}
                className={
                  page === l.page ? 'text-black' : 'text-[#555] hover:text-black transition-colors'
                }
              >
                {l.label}
              </button>
            ))}
          </nav>

          <button
            className="md:hidden p-2"
            aria-label="القائمة"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 top-[112px] bg-white z-[99] p-6 flex flex-col gap-1 overflow-y-auto md:hidden animate-fade-in">
          {[...navLinks, ...extraLinks].map((l) => (
            <button
              key={l.page}
              onClick={() => go(l.page)}
              className="py-3.5 text-lg font-medium border-b border-[#e5e5e5] text-black text-right"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
