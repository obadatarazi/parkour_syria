import type { FC } from 'react';
import type { PageId } from '@/types';
import { HomePage } from '@/pages/home/HomePage';
import { WhatPage } from '@/pages/what/WhatPage';
import { PathPage } from '@/pages/path/PathPage';
import { LessonPage } from '@/pages/path/LessonPage';
import { DirectoryPage } from '@/pages/directory/DirectoryPage';
import { DirDetailPage } from '@/pages/directory/DirDetailPage';
import { EventsPage } from '@/pages/events/EventsPage';
import { SuggestPage } from '@/pages/suggest/SuggestPage';
import { BlogPage } from '@/pages/blog/BlogPage';
import { ArticlePage } from '@/pages/blog/ArticlePage';
import { BookPage } from '@/pages/book/BookPage';
import { AboutPage } from '@/pages/about/AboutPage';
import { ContactPage } from '@/pages/contact/ContactPage';
import { DisclaimerPage } from '@/pages/disclaimer/DisclaimerPage';

export {
  paths,
  detailOf,
  ROOT,
  pathFor,
  parsePath,
} from './paths';

export const pages: Record<PageId, FC> = {
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
