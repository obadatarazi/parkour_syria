import type {
  AttributeValueSummary,
  AttributeValueTitlePreview,
} from "@/features/attributes/types/attributes.types";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

export function getAttributeValueLabel(value: AttributeValueSummary): string {
  return formatBilingualLabel(getBilingualTitle(value.translations, value.title));
}

/** Slim list `valueTitles` entries: `{ en: "S", ar: "S" }`. */
export function getAttributeValueTitlePreviewLabel(
  titles: AttributeValueTitlePreview,
): string {
  return formatBilingualLabel({
    en: titles.en?.trim() || "",
    ar: titles.ar?.trim() || "",
  });
}

