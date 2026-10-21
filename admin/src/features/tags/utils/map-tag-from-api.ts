import type { Tag } from "@/features/tags/types/tags.types";
import { mapTranslatableFromApi } from "@/shared/lib/api/map-translatable-from-api.utils";
import { getTitleFromApiTranslations } from "@/shared/lib/api/normalize-translations.utils";

export function mapTagFromApi(tag: Tag): Tag {
  const mapped = mapTranslatableFromApi(tag);
  const title =
    mapped.title?.trim() ||
    getTitleFromApiTranslations(tag.translations, "") ||
    "";

  return {
    ...mapped,
    title,
  };
}
