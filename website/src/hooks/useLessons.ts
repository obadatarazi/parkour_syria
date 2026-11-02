import { useMemo } from 'react';
import type { Lesson } from '@/types';
import { mapLessons } from '@/services/mappers';
import { useDemoStrings } from './useDemoStrings';

export function useLessons(): {
  data: Lesson[];
  loading: false;
  error: null;
} {
  const { demo } = useDemoStrings();
  const data = useMemo(() => mapLessons(demo), [demo]);
  return { data, loading: false, error: null };
}
