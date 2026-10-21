import { useCallback, useMemo } from "react";

import { galleryImagesService } from "@/features/gallery-images/services/gallery-images.service";
import type { GalleryImageListParams } from "@/features/gallery-images/types/gallery-images.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const GALLERY_IMAGE_FILTER_IDS = ["publish"] as const;

export function useGalleryImagesList(limit = 20) {
  const t = useTranslation();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "publish",
        label: t.status,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "true", label: t.publishedLabel },
          { value: "false", label: t.draftLabel },
        ],
      },
    ],
    [t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "sort_order:asc", label: t.sortOrder },
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({ publish: mapBooleanFilterValue(values.publish) }) satisfies Pick<GalleryImageListParams, "publish">,
    [],
  );

  const fetchFn = useCallback(
    (params: GalleryImageListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      galleryImagesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "gallery-images",
    exportPath: "/admin/gallery-images/export",
    fetchFn,
    limit,
    filterIds: [...GALLERY_IMAGE_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "sort_order:asc",
  });

  return { ...list, filterDefinitions, sortDefinitions };
}
