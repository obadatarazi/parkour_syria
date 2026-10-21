import {
  areas,
  blogPostsNeutral,
  directoryItemsNeutral,
  eventsNeutral,
  galleryImagesNeutral,
  lessonsNeutral,
  slidesNeutral,
} from '@/data/demo';
import type { AreaId, BlogPost, DirectoryItem, GalleryImage, Lesson, ParkourEvent, Slide } from '@/types';
import type { DemoStrings, FormatDate } from './demoStrings';

export function mapDirectory(demo: DemoStrings): DirectoryItem[] {
  return directoryItemsNeutral.map((item) => {
    const loc = demo.directory[item.id];
    return {
      ...item,
      name: loc?.name ?? item.id,
      area: demo.areas[item.areaId] ?? item.areaId,
      description: loc?.description ?? '',
    };
  });
}

export function mapEvents(demo: DemoStrings, formatDate: FormatDate): ParkourEvent[] {
  return eventsNeutral.map((item) => {
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
}

export function mapPosts(demo: DemoStrings, formatDate: FormatDate): BlogPost[] {
  return blogPostsNeutral.map((item) => {
    const loc = demo.blog[item.id];
    return {
      ...item,
      category: demo.blogCategories[item.categoryId] ?? item.categoryId,
      date: formatDate(item.publishedAt, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
      title: loc?.title ?? item.id,
      excerpt: loc?.excerpt ?? '',
      body: item.hasBody ? loc?.body : undefined,
    };
  });
}

export function mapLessons(demo: DemoStrings): Lesson[] {
  return lessonsNeutral.map((item) => {
    const key = String(item.num);
    const loc = demo.lessons[key];
    return {
      ...item,
      title: loc?.title ?? key,
      desc: loc?.desc ?? '',
      body: item.hasBody ? loc?.body : undefined,
    };
  });
}

export function mapGallery(demo: DemoStrings): GalleryImage[] {
  return galleryImagesNeutral.map((item) => ({
    ...item,
    caption: demo.gallery[item.id] ?? '',
  }));
}

export function mapSlides(demo: DemoStrings): Slide[] {
  return slidesNeutral.map((item) => {
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
}

export function mapAreaLabels(demo: DemoStrings): { id: AreaId; label: string }[] {
  return areas.map((id) => ({
    id,
    label: demo.areas[id] ?? id,
  }));
}
