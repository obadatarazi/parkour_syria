import { useState, useCallback, useEffect } from 'react';
import { NavProvider } from '@/components/nav';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Preloader } from '@/components/Preloader';
import { PageLoader } from '@/components/PageLoader';
import { MouseTrackerCanvas } from '@/components/MouseTrackerCanvas';
import { CustomCursor } from '@/components/CustomCursor';
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
  const [page, setPage] = useState<PageId>('home');
  const [loading, setLoading] = useState(false);

  const navigate = useCallback(
    (p: PageId) => {
      if (p === page) return;
      setLoading(true);
      window.scrollTo(0, 0);
      setTimeout(() => {
        setPage(p);
        setLoading(false);
      }, 400);
    },
    [page]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const CurrentPage = pages[page];

  return (
    <NavProvider value={{ page, navigate }}>
      <Preloader />
      {loading && <PageLoader />}
      <CustomCursor />
      <div className="grain-overlay" aria-hidden="true" />
      <MouseTrackerCanvas />
      <div className="min-h-screen flex flex-col relative z-10 bg-[#0a0a0a]">
        <Header />
        <main className="flex-1">
          <div key={page} className="animate-fade-in">
            <CurrentPage />
          </div>
        </main>
        <Footer />
      </div>
    </NavProvider>
  );
}

export default App;
