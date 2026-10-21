import type { Attribute, AttributeValueSummary } from "@/features/attributes/types/attributes.types";
import type { Product } from "@/features/products/types/products.types";
import type { ProductAttributeItem } from "@/features/products/utils/variant-attribute.utils";
import { getTitleFromApiTranslations } from "@/shared/lib/api/normalize-translations.utils";

function mapProductAttributeItemToSummary(item: ProductAttributeItem): AttributeValueSummary {
  return {
    id: item.id,
    title: item.title ?? getTitleFromApiTranslations(item.translations, ""),
    ...(item.translations ? { translations: item.translations as AttributeValueSummary["translations"] } : {}),
  };
}

function mapProductAttributeToSeed(item: ProductAttributeItem): Attribute {
  return {
    id: item.id,
    title: item.title ?? getTitleFromApiTranslations(item.translations, ""),
    publish: true,
    values: [],
    ...(item.translations
      ? { translations: item.translations as Attribute["translations"] }
      : {}),
  };
}

/** Builds attribute picker seeds from product payload (no extra API calls). */
export function buildAttributeSeedsFromProduct(product: Product): Attribute[] {
  const byId = new Map<number, Attribute>();

  for (const attribute of product.attributes ?? []) {
    byId.set(attribute.id, mapProductAttributeToSeed(attribute));
  }

  for (const attributeValue of product.attributeValues ?? []) {
    const attributeId = attributeValue.attribute?.id;
    if (attributeId == null) continue;

    const existing = byId.get(attributeId);
    const attributeSeed =
      existing ??
      (attributeValue.attribute
        ? mapProductAttributeToSeed(attributeValue.attribute)
        : {
            id: attributeId,
            title: "",
            publish: true,
            values: [],
          });

    const values = [...(attributeSeed.values ?? [])];
    if (!values.some((value) => value.id === attributeValue.id)) {
      values.push(mapProductAttributeItemToSummary(attributeValue));
    }

    byId.set(attributeId, {
      ...attributeSeed,
      values,
    });
  }

  return [...byId.values()];
}

/** Build picker seeds for the configured variation attribute pool. */
export function buildAttributeSeedsFromPoolIds(
  catalog: Attribute[],
  poolAttributeIds: number[],
  poolAttributeValueIds: number[],
): Attribute[] {
  const attributeIdSet = new Set(poolAttributeIds);
  const valueIdSet = new Set(poolAttributeValueIds);

  return catalog
    .filter((attribute) => attributeIdSet.has(attribute.id))
    .map((attribute) => ({
      ...attribute,
      values: (attribute.values ?? []).filter((value) => valueIdSet.has(value.id)),
    }));
}

export function mergeAttributeCatalog(seeds: Attribute[], fetched: Attribute[]): Attribute[] {
  const byId = new Map<number, Attribute>();

  for (const attribute of fetched) {
    byId.set(attribute.id, {
      ...attribute,
      values: [...(attribute.values ?? [])],
    });
  }

  for (const seed of seeds) {
    const existing = byId.get(seed.id);
    if (!existing) {
      byId.set(seed.id, {
        ...seed,
        values: [...(seed.values ?? [])],
      });
      continue;
    }

    const valueById = new Map((existing.values ?? []).map((value) => [value.id, value]));
    for (const value of seed.values ?? []) {
      if (!valueById.has(value.id)) {
        valueById.set(value.id, value);
      }
    }

    byId.set(seed.id, {
      ...existing,
      title: existing.title || seed.title,
      translations: existing.translations ?? seed.translations,
      values: [...valueById.values()],
    });
  }

  return [...byId.values()];
}
