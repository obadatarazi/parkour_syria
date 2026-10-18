import { createContext, useContext, useCallback, type ReactNode } from 'react';
import type { PageId } from '@/data/demo';

interface NavContextValue {
  page: PageId;
  id?: string;
  navigate: (page: PageId, id?: string) => void;
}

const NavContext = createContext<NavContextValue | null>(null);

const paths: Record<PageId, string> = {
  home: '/',
  what: '/what-is-parkour',
  path: '/path',
  lesson: '/path',
  directory: '/directory',
  'dir-detail': '/directory',
  events: '/events',
  suggest: '/suggest',
  blog: '/blog',
  article: '/blog',
  book: '/book',
  about: '/about',
  contact: '/contact',
  disclaimer: '/disclaimer',
};

// Detail pages live under their list page: /blog/:id, /directory/:id, /path/:num
const detailOf: Partial<Record<PageId, PageId>> = {
  blog: 'article',
  directory: 'dir-detail',
  path: 'lesson',
};

// Site folder from vite.config base, e.g. "/parkour"
const ROOT = import.meta.env.BASE_URL.replace(/\/$/, '');

export function pathFor(page: PageId, id?: string) {
  const base = paths[page];
  return ROOT + (id ? `${base}/${encodeURIComponent(id)}` : base);
}

export function parsePath(pathname: string): { page: PageId; id?: string } {
  const local = pathname.startsWith(ROOT) ? pathname.slice(ROOT.length) : pathname;
  const [first = '', second] = local.replace(/\/+$/, '').split('/').filter(Boolean);
  const list = (Object.keys(paths) as PageId[]).find(
    (p) => paths[p] === `/${first}` && !Object.values(detailOf).includes(p)
  );
  if (!first) return { page: 'home' };
  if (!list) return { page: 'home' };
  if (second && detailOf[list]) return { page: detailOf[list]!, id: decodeURIComponent(second) };
  return { page: list };
}

export function NavProvider({
  value,
  children,
}: {
  value: NavContextValue;
  children: ReactNode;
}) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}

// Props for a real <a> link that still navigates in-app (keeps middle-click / copy link working).
export function useLink() {
  const { navigate } = useNav();
  return useCallback(
    (page: PageId, id?: string) => ({
      href: pathFor(page, id),
      onClick: (e: React.MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(page, id);
      },
    }),
    [navigate]
  );
}
