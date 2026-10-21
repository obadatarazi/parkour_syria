import { ReviewProductPicker } from "@/features/product-reviews/components/ReviewProductPicker";
import { BrandPicker } from "@/features/products/components/BrandPicker";
import { CategoryMultiPicker } from "@/features/products/components/CategoryMultiPicker";
import { TagMultiPicker } from "@/features/products/components/TagMultiPicker";
import type { TrendingSearchTargetTypeValue } from "@/features/trending-searches/types/trending-searches.types";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type TrendingSearchTargetPickerProps = {
  targetType: TrendingSearchTargetTypeValue | "";
  value: number | null;
  onChange: (targetId: number | null) => void;
  disabled?: boolean;
  error?: string;
};

function toSingleId(ids: number[]): number | null {
  if (ids.length === 0) return null;
  return ids[ids.length - 1] ?? null;
}

export function TrendingSearchTargetPicker({
  targetType,
  value,
  onChange,
  disabled = false,
  error,
}: TrendingSearchTargetPickerProps) {
  const t = useTranslation();

  if (!targetType || targetType === "KEYWORD") {
    return <p className="text-sm text-muted-foreground">{t.trendingSearchKeywordHint}</p>;
  }

  if (targetType === "BRAND") {
    return (
      <BrandPicker value={value} onChange={onChange} disabled={disabled} error={error} />
    );
  }

  if (targetType === "PRODUCT") {
    return (
      <ReviewProductPicker value={value} onChange={onChange} disabled={disabled} error={error} />
    );
  }

  if (targetType === "CATEGORY") {
    return (
      <CategoryMultiPicker
        value={value == null ? [] : [value]}
        onChange={(ids) => onChange(toSingleId(ids))}
        disabled={disabled}
        error={error}
      />
    );
  }

  return (
    <TagMultiPicker
      value={value == null ? [] : [value]}
      onChange={(ids) => onChange(toSingleId(ids))}
      disabled={disabled}
      error={error}
      required
    />
  );
}
