import type { Slide } from '@/types';
import type { DemoStrings } from './demoStrings';
import { mapSlides } from './mappers';

export function getSlides(demo: DemoStrings): Promise<Slide[]> {
  return Promise.resolve(mapSlides(demo));
}
