import { useState, useCallback, useEffect } from 'react';
import { NavProvider, parsePath, pathFor } from '@/components/nav';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Preloader } from '@/components/Preloader';
import { CustomCursor } from '@/components/CustomCursor';
import { useI18n } from '@/i18n/useI18n';
import type { PageId } from '@/data/demo';
import { HomePage } from '@/pages/HomePage';
import { WhatPage } from '@/pages/WhatPage';
import { PathPage } from '@/pages/PathPage';
import { LessonPage } from '@/pages/LessonPage';
import { DirectoryPage } from '@/pages/DirectoryPage';
import { DirDetailPage } from '@/pages/DirDetailPage';
import { EventsPage } from '@/pages/EventsPage';
import { SuggestPage } from '@/pages/SuggestPage';
import { BlogPage } from '@/pages/BlogPage';
import { ArticlePage } from '@/pages/ArticlePage';
import { BookPage } from '@/pages/BookPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { DisclaimerPage } from '@/pages/DisclaimerPage';

const pages: Record<PageId, React.FC> = {
  home: HomePage,
  what: WhatPage,
  path: PathPage,
  lesson: LessonPage,
  directory: DirectoryPage,
  'dir-detail': DirDetailPage,
  events: EventsPage,
  suggest: SuggestPage,
  blog: BlogPage,
  article: ArticlePage,
  book: BookPage,
  about: AboutPage,
  contact: ContactPage,
  disclaimer: DisclaimerPage,
};

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
