/** Pages that have labels under `nav.*` in locales. */
export type NavPageId =
  | 'home'
  | 'what'
  | 'path'
  | 'directory'
  | 'events'
  | 'blog'
  | 'book'
  | 'suggest'
  | 'about'
  | 'contact'
  | 'disclaimer';

export type PageId =
  | NavPageId
  | 'lesson'
  | 'dir-detail'
  | 'article';

export const navLinks: NavPageId[] = [
  'home',
  'what',
  'path',
  'directory',
  'events',
  'blog',
  'book',
];
