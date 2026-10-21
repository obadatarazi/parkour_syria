import { useState, useCallback, useEffect } from 'react';
import { NavProvider } from '@/components/nav';
import { parsePath, pathFor, pages } from '@/app/routes';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Preloader } from '@/components/motion/Preloader';
import { CustomCursor } from '@/components/motion/CustomCursor';
import { useI18n } from '@/i18n/useI18n';
import type { PageId } from '@/data/demo';

function App() {
  const { t, lang } = useI18n();
  const [route, setRoute] = useState(() => parsePath(window.location.pathname));
  const { page, id } = route;

  const navigate = useCallback((p: PageId, nextId?: string) => {
    const url = pathFor(p, nextId);
    if (url !== window.location.pathname) window.history.pushState(null, '', url);
    setRoute({ page: p, id: nextId });
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${t(`meta.titles.${page}`)} | ${t('meta.titleSuffix')}`;
  }, [page, id, lang, t]);

  const CurrentPage = pages[page];

  return (
    <NavProvider value={{ page, id, navigate }}>
      <Preloader />
      <CustomCursor />
      <div className="min-h-screen flex flex-col relative z-10 bg-[#0a0a0a]">
        <Header />
        <main className="flex-1">
          <div key={`${page}/${id ?? ''}`} className="animate-fade-in">
            <CurrentPage />
          </div>
        </main>
        <Footer />
      </div>
    </NavProvider>
  );
}

export default App;
