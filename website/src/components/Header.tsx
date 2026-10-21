import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useNav, useLink } from '@/components/nav';
import { LanguageToggle } from '@/components/LanguageToggle';
import { navLinks, type NavPageId } from '@/data/demo';
import { useI18n } from '@/i18n/useI18n';

const extraLinks: NavPageId[] = ['suggest', 'about', 'contact', 'disclaimer'];

export function Header() {
  const { page } = useNav();
  const link = useLink();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [page]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allMobile = [...navLinks, ...extraLinks];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${
          scrolled
            ? 'bg-black/90 backdrop-blur-md py-3 border-b border-white/5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container-x flex items-center justify-between gap-4">
          <a
            {...link('home')}
            className="font-extrabold text-lg sm:text-xl tracking-tight rtl:tracking-normal flex items-center gap-2.5 text-white"
          >
            <span className="bg-white text-black w-8 h-8 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
              {t('brand.logoLetter')}
            </span>
            <span className="hidden xs:inline">{t('brand.name')}</span>
            <span className="xs:hidden">{t('brand.shortName')}</span>
          </a>

          <nav className="hidden lg:flex gap-8 text-sm font-medium">
            {navLinks.map((p) => (
              <a
                key={p}
                {...link(p)}
                className={`transition-colors relative group ${
                  page === p ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {t(`nav.${p}`)}
                <span
                  className={`absolute -bottom-1 start-0 h-[1px] bg-white transition-all duration-300 ${
                    page === p ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* TEMP: language toggle for testing */}
            <LanguageToggle />
            <button
              className="lg:hidden p-2 text-white"
              aria-label={t('header.menu')}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 top-0 bg-black z-[99] p-6 pt-24 flex flex-col gap-1 overflow-y-auto lg:hidden animate-fade-in">
          {allMobile.map((p) => (
            <a
              key={p}
              {...link(p)}
              className={`block py-4 text-2xl font-bold border-b border-white/5 text-start transition-colors ${
                page === p ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {t(`nav.${p}`)}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
