import { useMemo } from 'react';
import type { AreaId, DirCategory } from '@/types';
import { mapAreaLabels } from '@/services/mappers';
import { useDemoStrings } from './useDemoStrings';

export function useSiteMeta(): {
  data: {
    city: string;
    categories: Record<string, string>;
    categoriesPlural: Record<string, string>;
    blogCategories: Record<string, string>;
    dirCategoryLabels: Record<DirCategory, string>;
    areaLabels: { id: AreaId; label: string }[];
  };
  loading: false;
  error: null;
} {
  const { demo } = useDemoStrings();
  const data = useMemo(
    () => ({
      city: demo.city,
      categories: demo.categories,
      categoriesPlural: demo.categoriesPlural,
      blogCategories: demo.blogCategories,
      dirCategoryLabels: demo.categories as Record<DirCategory, string>,
      areaLabels: mapAreaLabels(demo),
    }),
    [demo]
  );
  return { data, loading: false, error: null };
}
