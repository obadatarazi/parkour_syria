import type { ParkourEvent } from '@/types';
import type { DemoStrings, FormatDate } from './demoStrings';
import { mapEvents } from './mappers';

export function getEvents(demo: DemoStrings, formatDate: FormatDate): Promise<ParkourEvent[]> {
  return Promise.resolve(mapEvents(demo, formatDate));
}
