import type {
  Attribute,
  AttributeValueTitlePreview,
} from "@/features/attributes/types/attributes.types";
import { mapTranslatableFromApi } from "@/shared/lib/api/map-translatable-from-api.utils";
import { getTitleFromApiTranslations } from "@/shared/lib/api/normalize-translations.utils";

type RawAttribute = Attribute & {
  valuesCount?: number;
  valueTitles?: AttributeValueTitlePreview[];
};

export function mapAttributeFromApi(attribute: RawAttribute): Attribute {
  const mapped = mapTranslatableFromApi(attribute);
  const title =
    mapped.title?.trim() ||
    getTitleFromApiTranslations(attribute.translations, "") ||
    "";

  return {
    ...mapped,
    title,
    values: attribute.values
      ? attribute.values.map((value) => mapTranslatableFromApi(value))
      : undefined,
    valuesCount: attribute.valuesCount ?? attribute.values?.length,
    valueTitles: attribute.valueTitles,
  };
}
