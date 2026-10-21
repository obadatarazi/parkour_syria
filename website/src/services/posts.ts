import type { BlogPost } from '@/types';
import type { DemoStrings, FormatDate } from './demoStrings';
import { mapPosts } from './mappers';

export function getPosts(demo: DemoStrings, formatDate: FormatDate): Promise<BlogPost[]> {
  return Promise.resolve(mapPosts(demo, formatDate));
}

export async function getPost(
  slug: string,
  demo: DemoStrings,
  formatDate: FormatDate
): Promise<BlogPost | undefined> {
  const posts = await getPosts(demo, formatDate);
  return posts.find((p) => p.id === slug);
}
