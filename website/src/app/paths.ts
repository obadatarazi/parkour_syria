import type { PageId } from '@/data/demo';

export const paths: Record<PageId, string> = {
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

/** Detail pages live under their list page: /blog/:id, /directory/:id, /path/:num */
export const detailOf: Partial<Record<PageId, PageId>> = {
  blog: 'article',
  directory: 'dir-detail',
  path: 'lesson',
};

/** Site folder from vite.config base, e.g. "/parkour" */
export const ROOT = import.meta.env.BASE_URL.replace(/\/$/, '');

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
