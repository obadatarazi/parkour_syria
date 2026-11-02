import { useMemo } from 'react';
import type { DirectoryItem } from '@/types';
import { mapDirectory } from '@/services/mappers';
import { useDemoStrings } from './useDemoStrings';

export function useDirectory(): {
  data: DirectoryItem[];
  loading: false;
  error: null;
} {
  const { demo } = useDemoStrings();
  const data = useMemo(() => mapDirectory(demo), [demo]);
  return { data, loading: false, error: null };
}

export function useDirectoryItem(slug: string | undefined): {
  data: DirectoryItem;
  loading: false;
  error: null;
} {
  const { data: items, loading, error } = useDirectory();
  const data = items.find((d) => d.id === slug) ?? items[0];
  return { data, loading, error };
}
