import { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);

  const go = (p: PageId) => {
    navigate(p);
    setOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled
            ? 'bg-black/90 backdrop-blur-md py-3 border-b border-white/5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container-x flex items-center justify-between gap-4">
          <button
            onClick={() => go('home')}
            className="font-extrabold text-lg sm:text-xl tracking-tight flex items-center gap-2.5 text-white"
          >
            <span className="bg-white text-black w-8 h-8 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
              ب
            </span>
            <span className="hidden xs:inline">باركور سوريا</span>
            <span className="xs:hidden">باركور</span>
          </button>

          <nav className="hidden lg:flex gap-8 text-sm font-medium">
            {navLinks.map((l) => (
              <button
                key={l.page}
                onClick={() => go(l.page)}
                className={`transition-colors relative group ${
                  page === l.page ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1 right-0 h-[1px] bg-white transition-all duration-300 ${
                    page === l.page ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            ))}
          </nav>

          <button
            className="lg:hidden p-2 text-white"
            aria-label="القائمة"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 top-0 bg-black z-[99] p-6 pt-24 flex flex-col gap-1 overflow-y-auto lg:hidden animate-fade-in">
          {[...navLinks, ...extraLinks].map((l) => (
            <button
              key={l.page}
              onClick={() => go(l.page)}
              className={`py-4 text-2xl font-bold border-b border-white/5 text-right transition-colors ${
                page === l.page ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
