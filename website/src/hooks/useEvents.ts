import { useMemo } from 'react';
import type { ParkourEvent } from '@/types';
import { mapEvents } from '@/services/mappers';
import { useDemoStrings } from './useDemoStrings';

export function useEvents(): {
  data: ParkourEvent[];
  loading: false;
  error: null;
} {
  const { demo, formatDate } = useDemoStrings();
  const data = useMemo(() => mapEvents(demo, formatDate), [demo, formatDate]);
  return { data, loading: false, error: null };
}
