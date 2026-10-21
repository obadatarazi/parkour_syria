import type { GalleryImage } from '@/types';
import type { DemoStrings } from './demoStrings';
import { mapGallery } from './mappers';

export function getGallery(demo: DemoStrings): Promise<GalleryImage[]> {
  return Promise.resolve(mapGallery(demo));
}
