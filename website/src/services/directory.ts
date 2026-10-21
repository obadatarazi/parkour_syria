import type { DirectoryItem } from '@/types';
import type { DemoStrings } from './demoStrings';
import { mapDirectory } from './mappers';

export function getDirectory(demo: DemoStrings): Promise<DirectoryItem[]> {
  return Promise.resolve(mapDirectory(demo));
}

export async function getDirectoryItem(
  slug: string,
  demo: DemoStrings
): Promise<DirectoryItem | undefined> {
  const items = await getDirectory(demo);
  return items.find((d) => d.id === slug);
}
