export type DirCategory = 'place' | 'coach' | 'team';
export type EventTypeId = 'workshop' | 'gathering';
export type BlogCategoryId = 'safety' | 'training' | 'damascus';
export type AreaId = 'mazzeh' | 'abu-rummaneh' | 'kafr-sousa' | 'other';

export type PageId =
  | 'home'
  | 'what'
  | 'path'
  | 'lesson'
  | 'directory'
  | 'dir-detail'
  | 'events'
  | 'suggest'
  | 'blog'
  | 'article'
  | 'book'
  | 'about'
  | 'contact'
  | 'disclaimer';

export interface DirectoryItemNeutral {
  id: string;
  category: DirCategory;
  areaId: AreaId;
  verified: boolean;
  whatsapp: string;
  image: string;
}

export const directoryItemsNeutral: DirectoryItemNeutral[] = [
  {
    id: 'tishreen-park',
    category: 'place',
    areaId: 'mazzeh',
    verified: true,
    whatsapp: '963999000111',
    image:
      'https://images.pexels.com/photos/6008952/pexels-photo-6008952.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'ahmad-halabi',
    category: 'coach',
    areaId: 'abu-rummaneh',
    verified: true,
    whatsapp: '963999000222',
    image:
      'https://images.pexels.com/photos/6008894/pexels-photo-6008894.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'damascus-freerun',
    category: 'team',
    areaId: 'kafr-sousa',
    verified: false,
    whatsapp: '963999000333',
    image:
      'https://images.pexels.com/photos/6008975/pexels-photo-6008975.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'sara-dimashqi',
    category: 'coach',
    areaId: 'mazzeh',
    verified: false,
    whatsapp: '963999000444',
    image:
      'https://images.pexels.com/photos/9645058/pexels-photo-9645058.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'shami-parkour',
    category: 'team',
    areaId: 'mazzeh',
    verified: true,
    whatsapp: '963999000555',
    image:
      'https://images.pexels.com/photos/6009162/pexels-photo-6009162.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'jalaa-park',
    category: 'place',
    areaId: 'abu-rummaneh',
    verified: false,
    whatsapp: '963999000666',
    image:
      'https://images.pexels.com/photos/6008986/pexels-photo-6008986.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export interface ParkourEventNeutral {
  id: string;
  typeId: EventTypeId;
  startsAt: string;
  whatsapp: string;
  image: string;
}

export const eventsNeutral: ParkourEventNeutral[] = [
  {
    id: 'safety-workshop',
    typeId: 'workshop',
    startsAt: '2026-10-24T10:00:00',
    whatsapp: '963999000111',
    image:
      'https://images.pexels.com/photos/6008917/pexels-photo-6008917.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'friday-gathering',
    typeId: 'gathering',
    startsAt: '2026-10-23T16:00:00',
    whatsapp: '963999000333',
    image:
      'https://images.pexels.com/photos/6009290/pexels-photo-6009290.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'balance-workshop',
    typeId: 'workshop',
    startsAt: '2026-11-01T09:00:00',
    whatsapp: '963999000222',
    image:
      'https://images.pexels.com/photos/6009176/pexels-photo-6009176.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export interface BlogPostNeutral {
  id: string;
  categoryId: BlogCategoryId;
  publishedAt: string;
  image: string;
  hasBody: boolean;
}

export const blogPostsNeutral: BlogPostNeutral[] = [
  {
    id: 'safety-rules',
    categoryId: 'safety',
    publishedAt: '2026-10-05',
    image:
      'https://images.pexels.com/photos/33938537/pexels-photo-33938537.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hasBody: true,
  },
  {
    id: 'home-strength',
    categoryId: 'training',
    publishedAt: '2026-10-01',
    image:
      'https://images.pexels.com/photos/6008881/pexels-photo-6008881.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hasBody: false,
  },
  {
    id: 'damascus-places',
    categoryId: 'damascus',
    publishedAt: '2026-09-28',
    image:
      'https://images.pexels.com/photos/6008979/pexels-photo-6008979.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hasBody: false,
  },
];

export interface GalleryImageNeutral {
  id: string;
  url: string;
}

export const galleryImagesNeutral: GalleryImageNeutral[] = [
  {
    id: 'g1',
    url: 'https://images.pexels.com/photos/6008908/pexels-photo-6008908.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'g2',
    url: 'https://images.pexels.com/photos/6009002/pexels-photo-6009002.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'g3',
    url: 'https://images.pexels.com/photos/32189329/pexels-photo-32189329.png?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'g4',
    url: 'https://images.pexels.com/photos/6009260/pexels-photo-6009260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'g5',
    url: 'https://images.pexels.com/photos/6008994/pexels-photo-6008994.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'g6',
    url: 'https://images.pexels.com/photos/6009001/pexels-photo-6009001.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'g7',
    url: 'https://images.pexels.com/photos/6009275/pexels-photo-6009275.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'g8',
    url: 'https://images.pexels.com/photos/6009011/pexels-photo-6009011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export interface LessonNeutral {
  num: number;
  hasBody: boolean;
}

export const lessonsNeutral: LessonNeutral[] = [
  { num: 1, hasBody: true },
  { num: 2, hasBody: false },
  { num: 3, hasBody: false },
  { num: 4, hasBody: false },
  { num: 5, hasBody: false },
  { num: 6, hasBody: false },
  { num: 7, hasBody: false },
];

export interface SlideNeutral {
  id: string;
  image: string;
  primaryPage: PageId;
  secondaryPage: PageId;
}

export const slidesNeutral: SlideNeutral[] = [
  {
    id: 's1',
    image:
      'https://images.pexels.com/photos/6008908/pexels-photo-6008908.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    primaryPage: 'path',
    secondaryPage: 'directory',
  },
  {
    id: 's2',
    image:
      'https://images.pexels.com/photos/9645058/pexels-photo-9645058.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    primaryPage: 'directory',
    secondaryPage: 'suggest',
  },
  {
    id: 's3',
    image:
      'https://images.pexels.com/photos/6009260/pexels-photo-6009260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    primaryPage: 'events',
    secondaryPage: 'blog',
  },
];

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

export const navLinks: NavPageId[] = [
  'home',
  'what',
  'path',
  'directory',
  'events',
  'blog',
  'book',
];

export const areas: AreaId[] = [
  'mazzeh',
  'abu-rummaneh',
  'kafr-sousa',
  'other',
];

/** @deprecated Prefer localized types from useDemo(). Kept for gradual migration. */
export type DirectoryItem = DirectoryItemNeutral & {
  name: string;
  area: string;
  description: string;
};

export type ParkourEvent = ParkourEventNeutral & {
  type: string;
  date: string;
  title: string;
  location: string;
};

export type BlogPost = BlogPostNeutral & {
  category: string;
  date: string;
  title: string;
  excerpt: string;
  body?: { heading: string; text: string }[];
};

export type GalleryImage = GalleryImageNeutral & { caption: string };

export type Lesson = LessonNeutral & {
  title: string;
  desc: string;
  body?: { heading: string; text: string; list?: string[] }[];
};

export type Slide = SlideNeutral & {
  cat: string;
  title: string;
  text: string;
  primary: { label: string; page: PageId };
  secondary: { label: string; page: PageId };
};
