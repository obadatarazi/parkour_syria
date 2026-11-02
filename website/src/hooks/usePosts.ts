import { useMemo } from 'react';
import type { BlogPost } from '@/types';
import { mapPosts } from '@/services/mappers';
import { useDemoStrings } from './useDemoStrings';

export function usePosts(): {
  data: BlogPost[];
  loading: false;
  error: null;
} {
  const { demo, formatDate } = useDemoStrings();
  const data = useMemo(() => mapPosts(demo, formatDate), [demo, formatDate]);
  return { data, loading: false, error: null };
}

export function usePost(slug: string | undefined): {
  data: BlogPost;
  loading: false;
  error: null;
} {
  const { data: posts, loading, error } = usePosts();
  const data = posts.find((p) => p.id === slug) ?? posts[0];
  return { data, loading, error };
}
