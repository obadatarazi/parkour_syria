import { useState, useCallback, useEffect, type ComponentType } from 'react';
import { NavProvider } from '@/components/nav';
import { parsePath, pathFor, pages } from '@/app/routes';
import { isUiKitPath } from '@/app/devRoute';
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
  const [wantsUiKit, setWantsUiKit] = useState(() => isUiKitPath(window.location.pathname));
  const [UiKitPage, setUiKitPage] = useState<ComponentType | null>(null);

  const navigate = useCallback((p: PageId, nextId?: string) => {
    const url = pathFor(p, nextId);
    if (url !== window.location.pathname) window.history.pushState(null, '', url);
    setWantsUiKit(false);
    setRoute({ page: p, id: nextId });
  }, []);

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      setWantsUiKit(isUiKitPath(path));
      setRoute(parsePath(path));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // DEV-only /ui-kit — dynamic import so production bundles omit the page.
  useEffect(() => {
    if (!import.meta.env.DEV || !wantsUiKit) {
      setUiKitPage(null);
      return;
    }
    let alive = true;
    void import('@/pages/ui-kit/UiKitPage').then((m) => {
      if (alive) setUiKitPage(() => m.UiKitPage);
    });
    return () => {
      alive = false;
    };
  }, [wantsUiKit]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (wantsUiKit) return;
    document.title = `${t(`meta.titles.${page}`)} | ${t('meta.titleSuffix')}`;
  }, [page, id, lang, t, wantsUiKit]);

  const CurrentPage = wantsUiKit ? UiKitPage : pages[page];

  return (
    <NavProvider value={{ page, id, navigate }}>
      <Preloader />
      <CustomCursor />
      <div className="min-h-screen flex flex-col relative z-10 bg-ps-black">
        <Header />
        <main className="flex-1">
          <div key={wantsUiKit ? 'ui-kit' : `${page}/${id ?? ''}`} className="animate-fade-in">
            {CurrentPage ? <CurrentPage /> : null}
          </div>
        </main>
        <Footer />
      </div>
    </NavProvider>
  );
}

export default App;
