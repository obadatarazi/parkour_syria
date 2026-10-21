import { useMemo } from 'react';
import type { Slide } from '@/types';
import { mapSlides } from '@/services/mappers';
import { useDemoStrings } from './useDemoStrings';

export function useSlides(): {
  data: Slide[];
  loading: false;
  error: null;
} {
  const { demo } = useDemoStrings();
  const data = useMemo(() => mapSlides(demo), [demo]);
  return { data, loading: false, error: null };
}
