import { useMemo } from "react";

import { useProductCatalogFilterOptions } from "@/features/products/hooks/use-product-catalog-filter-options";
import { SearchableSelectField } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

import { PRODUCT_PICKER_ALL_FILTER } from "../constants/product-picker.constants";

type ProductPickerCatalogFiltersProps = {
  brandFilter: string;
  categoryFilter: string;
  onBrandFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  disabled?: boolean;
  showHint?: boolean;
  className?: string;
};

export function ProductPickerCatalogFilters({
  brandFilter,
  categoryFilter,
  onBrandFilterChange,
  onCategoryFilterChange,
  disabled = false,
  showHint = false,
  className,
}: ProductPickerCatalogFiltersProps) {
  const t = useTranslation();
  const { brandOptions, categoryOptions, isLoading } = useProductCatalogFilterOptions();

  const brandSelectOptions = useMemo(
    () => [{ value: PRODUCT_PICKER_ALL_FILTER, label: t.filterAll }, ...brandOptions],
    [brandOptions, t.filterAll],
  );

  const categorySelectOptions = useMemo(
    () => [{ value: PRODUCT_PICKER_ALL_FILTER, label: t.filterAll }, ...categoryOptions],
    [categoryOptions, t.filterAll],
  );

  return (
    <div className={cn("space-y-2", className)}>
      {showHint ? (
        <p className="text-xs text-muted-foreground">{t.productPickerCatalogFilterHint}</p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        <SearchableSelectField
          label={t.brand}
          value={brandFilter}
          options={brandSelectOptions}
          placeholder={t.filterAll}
          disabled={disabled || isLoading}
          searchPlaceholder={t.productPickerFilterSearchPlaceholder}
          onValueChange={onBrandFilterChange}
        />
        <SearchableSelectField
          label={t.categories}
          value={categoryFilter}
          options={categorySelectOptions}
          placeholder={t.filterAll}
          disabled={disabled || isLoading}
          searchPlaceholder={t.productPickerFilterSearchPlaceholder}
          onValueChange={onCategoryFilterChange}
        />
      </div>
    </div>
  );
}
