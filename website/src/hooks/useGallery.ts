import { useMemo } from 'react';
import type { GalleryImage } from '@/types';
import { mapGallery } from '@/services/mappers';
import { useDemoStrings } from './useDemoStrings';

export function useGallery(): {
  data: GalleryImage[];
  loading: false;
  error: null;
} {
  const { demo } = useDemoStrings();
  const data = useMemo(() => mapGallery(demo), [demo]);
  return { data, loading: false, error: null };
}
