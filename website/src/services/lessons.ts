import type { Lesson } from '@/types';
import type { DemoStrings } from './demoStrings';
import { mapLessons } from './mappers';

export function getLessons(demo: DemoStrings): Promise<Lesson[]> {
  return Promise.resolve(mapLessons(demo));
}
