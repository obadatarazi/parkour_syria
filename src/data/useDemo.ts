import { useMemo } from 'react';
import { useI18n } from '@/i18n/useI18n';
import {
  areas,
  blogPostsNeutral,
  directoryItemsNeutral,
  eventsNeutral,
  galleryImagesNeutral,
  lessonsNeutral,
  navLinks,
  slidesNeutral,
  type AreaId,
  type BlogPost,
  type DirectoryItem,
  type GalleryImage,
  type Lesson,
  type ParkourEvent,
  type Slide,
} from './demo';

interface DemoStrings {
  categories: Record<string, string>;
  categoriesPlural: Record<string, string>;
  areas: Record<string, string>;
  city: string;
  directory: Record<string, { name: string; description: string }>;
  eventTypes: Record<string, string>;
  events: Record<string, { title: string; location: string }>;
  blogCategories: Record<string, string>;
  blog: Record<
    string,
    {
      title: string;
      excerpt: string;
      body?: { heading: string; text: string }[];
    }
  >;
  gallery: Record<string, string>;
  lessons: Record<
    string,
    {
      title: string;
      desc: string;
      body?: { heading: string; text: string; list?: string[] }[];
    }
  >;
  slides: Record<
    string,
    {
      cat: string;
      title: string;
      text: string;
      primary: string;
      secondary: string;
    }
  >;
}

export function useDemo() {
  const { tm, formatDate } = useI18n();
  const demo = tm<DemoStrings>('demo');

  return useMemo(() => {
    const directoryItems: DirectoryItem[] = directoryItemsNeutral.map(
      (item) => {
        const loc = demo.directory[item.id];
        return {
          ...item,
          name: loc?.name ?? item.id,
          area: demo.areas[item.areaId] ?? item.areaId,
          description: loc?.description ?? '',
        };
      }
    );

    const events: ParkourEvent[] = eventsNeutral.map((item) => {
      const loc = demo.events[item.id];
      return {
        ...item,
        type: demo.eventTypes[item.typeId] ?? item.typeId,
        date: formatDate(item.startsAt, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: 'numeric',
          minute: '2-digit',
        }),
        title: loc?.title ?? item.id,
        location: loc?.location ?? '',
      };
    });

    const blogPosts: BlogPost[] = blogPostsNeutral.map((item) => {
      const loc = demo.blog[item.id];
      return {
        ...item,
        category: demo.blogCategories[item.categoryId] ?? item.categoryId,
        date: formatDate(item.publishedAt, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          // Date-only ISO strings parse as UTC midnight; pin UTC so the
          // calendar day does not shift west of UTC.
          timeZone: 'UTC',
        }),
        title: loc?.title ?? item.id,
        excerpt: loc?.excerpt ?? '',
        body: item.hasBody ? loc?.body : undefined,
      };
    });

    const galleryImages: GalleryImage[] = galleryImagesNeutral.map((item) => ({
      ...item,
      caption: demo.gallery[item.id] ?? '',
    }));

    const lessons: Lesson[] = lessonsNeutral.map((item) => {
      const key = String(item.num);
      const loc = demo.lessons[key];
      return {
        ...item,
        title: loc?.title ?? key,
        desc: loc?.desc ?? '',
        body: item.hasBody ? loc?.body : undefined,
      };
    });

    const slides: Slide[] = slidesNeutral.map((item) => {
      const loc = demo.slides[item.id];
      return {
        ...item,
        cat: loc?.cat ?? '',
        title: loc?.title ?? '',
        text: loc?.text ?? '',
        primary: {
          label: loc?.primary ?? '',
          page: item.primaryPage,
        },
        secondary: {
          label: loc?.secondary ?? '',
          page: item.secondaryPage,
        },
      };
    });

    const areaLabels = areas.map((id) => ({
      id,
      label: demo.areas[id] ?? id,
    }));

    return {
      directoryItems,
      events,
      blogPosts,
      galleryImages,
      lessons,
      slides,
      navLinks,
      areas: areas as AreaId[],
      areaLabels,
      categories: demo.categories,
      categoriesPlural: demo.categoriesPlural,
      blogCategories: demo.blogCategories,
      city: demo.city,
      dirCategoryLabels: demo.categories as Record<
        'place' | 'coach' | 'team',
        string
      >,
    };
  }, [demo, formatDate]);
}
