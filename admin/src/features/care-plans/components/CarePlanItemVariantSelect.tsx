import { useEffect, useMemo, useRef } from "react";

import { productsService } from "@/features/products/services/products.service";
import type { Product } from "@/features/products/types/products.types";
import {
  getVariantDisplayLabel,
  normalizeProductType,
} from "@/features/products/utils/variant-attribute.utils";
import { SelectField } from "@/shared/components";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

type CarePlanItemVariantSelectProps = {
  productId: number | null;
  value: number | null;
  onChange: (variantId: number | null) => void;
  disabled?: boolean;
};

export function CarePlanItemVariantSelect({
  productId,
  value,
  onChange,
  disabled = false,
}: CarePlanItemVariantSelectProps) {
  const t = useTranslation();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const query = useCrudQuery<Product>({
    queryKey: ["products", "care-plan-variant", String(productId ?? "")],
    queryFn: (signal) => productsService.getById(productId as number, signal),
    enabled: productId != null && productId > 0,
  });

  const isVariable =
    query.data != null && normalizeProductType(query.data.type) === "VARIABLE_PRODUCT";
  const variants = useMemo(() => query.data?.variants ?? [], [query.data?.variants]);

  useEffect(() => {
    if (productId == null) {
      if (value != null) onChangeRef.current(null);
      return;
    }
    if (!query.isSuccess || !query.data) return;
    if (normalizeProductType(query.data.type) !== "VARIABLE_PRODUCT") {
      if (value != null) onChangeRef.current(null);
      return;
    }
    const allowed = new Set((query.data.variants ?? []).map((variant) => variant.id));
    if (value != null && !allowed.has(value)) {
      onChangeRef.current(null);
    }
  }, [productId, query.data, query.isSuccess, value]);

  const options = useMemo(
    () =>
      variants.map((variant) => {
        const label = getVariantDisplayLabel(variant, `#${variant.id}`);
        const sku = variant.skuCode?.trim();
        return {
          value: String(variant.id),
          label: sku && label !== sku ? `${label} · ${sku}` : label,
        };
      }),
    [variants],
  );

  if (productId == null) return null;
  if (query.isLoading) {
    return (
      <SelectField
        label={t.carePlanProductVariant}
        value="__loading"
        onValueChange={() => undefined}
        options={[{ value: "__loading", label: t.loadingMessage, disabled: true }]}
        disabled
      />
    );
  }
  if (query.isError) {
    return (
      <p className="text-xs text-destructive">{resolveServiceErrorMessage(query.error, t)}</p>
    );
  }
  if (!isVariable || variants.length === 0) return null;

  return (
    <SelectField
      label={t.carePlanProductVariant}
      value={value == null ? "" : String(value)}
      onValueChange={(next) => onChange(next ? Number(next) : null)}
      options={options}
      placeholder={t.carePlanSelectVariant}
      helperText={t.carePlanProductVariantHint}
      required
      disabled={disabled}
    />
  );
}
