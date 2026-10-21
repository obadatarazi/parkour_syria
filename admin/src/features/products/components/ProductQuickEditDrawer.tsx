import { useEffect, useMemo, useState } from "react";

import { BrandPicker } from "@/features/products/components/BrandPicker";
import { CategoryMultiPicker } from "@/features/products/components/CategoryMultiPicker";
import { TagMultiPicker } from "@/features/products/components/TagMultiPicker";
import { useProductMutations } from "@/features/products/hooks/use-product-mutations";
import { productsService } from "@/features/products/services/products.service";
import type { Product, ProductFormData } from "@/features/products/types/products.types";
import {
  hasProductFormChanges,
  productToFormData,
} from "@/features/products/types/products.types";
import { normalizeProductType } from "@/features/products/utils/variant-attribute.utils";
import { TextField, ToggleField } from "@/shared/components";
import { CrudEntityDrawer, CrudFormFooter, CrudFormShell, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ProductQuickEditDrawerProps = {
  open: boolean;
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

type QuickEditFormState = {
  brandId: number | null;
  categoryIds: number[];
  tagIds: number[];
  price: number;
  stock: number;
  skuCode: string;
  eanCode: string;
  publish: boolean;
  featured: boolean;
  bestSeller: boolean;
  newlyArrived: boolean;
  isProductYouWillLove: boolean;
  hasDiscountPrice: boolean;
  approveAddToCarePlan: boolean;
};

function toQuickEditState(form: ProductFormData): QuickEditFormState {
  return {
    brandId: form.brandId,
    categoryIds: form.categoryIds,
    tagIds: form.tagIds,
    price: form.price,
    stock: form.stock,
    skuCode: form.skuCode,
    eanCode: form.eanCode,
    publish: form.publish,
    featured: form.featured,
    bestSeller: form.bestSeller,
    newlyArrived: form.newlyArrived,
    isProductYouWillLove: form.isProductYouWillLove,
    hasDiscountPrice: form.hasDiscountPrice,
    approveAddToCarePlan: form.approveAddToCarePlan,
  };
}

function applyQuickEditToForm(
  original: ProductFormData,
  quick: QuickEditFormState,
): ProductFormData {
  const next: ProductFormData = {
    ...original,
    brandId: quick.brandId,
    categoryIds: quick.categoryIds,
    tagIds: quick.tagIds,
    publish: quick.publish,
    featured: quick.featured,
    bestSeller: quick.bestSeller,
    newlyArrived: quick.newlyArrived,
    isProductYouWillLove: quick.isProductYouWillLove,
    hasDiscountPrice: quick.hasDiscountPrice,
    approveAddToCarePlan: quick.approveAddToCarePlan,
  };

  if (normalizeProductType(original.type) === "SIMPLE") {
    next.price = quick.price;
    next.stock = quick.stock;
    next.skuCode = quick.skuCode;
    next.eanCode = quick.eanCode;
    if (!quick.hasDiscountPrice) {
      next.priceDiscount = null;
      next.priceDiscountPercentage = "";
      next.discountStartAt = "";
      next.discountExpireAt = "";
    }
  }

  return next;
}

/**
 * Compact editor for price, stock, categories, tags, brand, and visibility —
 * not translation/content fields.
 */
export function ProductQuickEditDrawer({
  open,
  product,
  onOpenChange,
  onSuccess,
}: ProductQuickEditDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useProductMutations({
    onSuccess: async () => {
      await onSuccess();
      onOpenChange(false);
    },
  });

  const { data: productDetail, isLoading: isProductLoading } = useCrudQuery({
    queryKey: ["products", "quick-edit", String(product?.id ?? "")],
    queryFn: () => productsService.getById(product!.id),
    enabled: open && Boolean(product?.id),
  });

  const resolvedProduct = productDetail ?? product;
  const originalForm = useMemo(
    () => (resolvedProduct ? productToFormData(resolvedProduct) : null),
    [resolvedProduct],
  );
  const isSimple = originalForm
    ? normalizeProductType(originalForm.type) === "SIMPLE"
    : true;

  const [form, setForm] = useState<QuickEditFormState | null>(null);

  useEffect(() => {
    if (!open || !originalForm) return;
    setForm(toQuickEditState(originalForm));
  }, [open, originalForm]);

  const relationSeeds = useMemo(
    () => ({
      brand: resolvedProduct?.brand ?? null,
      categories: resolvedProduct?.categories ?? [],
      tags: resolvedProduct?.tags ?? [],
    }),
    [resolvedProduct],
  );

  const updateForm = (patch: Partial<QuickEditFormState>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resolvedProduct || !originalForm || !form) return;

    const nextForm = applyQuickEditToForm(originalForm, form);
    if (!hasProductFormChanges(originalForm, nextForm)) {
      onOpenChange(false);
      return;
    }

    const result = await save(
      "edit",
      nextForm,
      resolvedProduct,
      originalForm,
    );
    if (result?.status === "skipped") {
      onOpenChange(false);
    }
  };

  return (
    <CrudEntityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t.quickEditProduct}
      description={t.quickEditProductDescription}
      size="md"
      isLoading={isSaving || (isProductLoading && !productDetail)}
    >
      {form && originalForm ? (
        <CrudFormShell onSubmit={handleSubmit} className="space-y-5">
          <BrandPicker
            value={form.brandId}
            seedItem={relationSeeds.brand}
            onChange={(brandId) => updateForm({ brandId })}
          />
          <CategoryMultiPicker
            value={form.categoryIds}
            seedItems={relationSeeds.categories}
            onChange={(categoryIds) => updateForm({ categoryIds })}
          />
          <TagMultiPicker
            value={form.tagIds}
            seedItems={relationSeeds.tags}
            onChange={(tagIds) => updateForm({ tagIds })}
          />

          {isSimple ? (
            <div className="space-y-4 rounded-xl border border-border bg-muted/15 p-4">
              <p className="text-xs font-semibold text-foreground">{t.productTabAttributes}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label={t.skuCode}
                  value={form.skuCode}
                  onChange={(event) => updateForm({ skuCode: event.target.value })}
                />
                <TextField
                  label={t.eanCode}
                  value={form.eanCode}
                  onChange={(event) => updateForm({ eanCode: event.target.value })}
                />
                <TextField
                  label={t.price}
                  type="number"
                  min={0}
                  step="0.1"
                  value={String(form.price)}
                  onChange={(event) =>
                    updateForm({ price: Number(event.target.value) || 0 })
                  }
                />
                <TextField
                  label={t.stock}
                  type="number"
                  min={0}
                  value={String(form.stock)}
                  onChange={(event) =>
                    updateForm({ stock: Number(event.target.value) || 0 })
                  }
                />
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              {t.quickEditVariableHint}
            </p>
          )}

          <div className="space-y-3 rounded-xl border border-border bg-muted/15 p-4">
            <p className="text-xs font-semibold text-foreground">{t.productVisibility}</p>
            <ToggleField
              label={t.publish}
              checked={form.publish}
              onCheckedChange={(publish) => updateForm({ publish })}
            />
            <ToggleField
              label={t.featured}
              checked={form.featured}
              onCheckedChange={(featured) => updateForm({ featured })}
            />
            <ToggleField
              label={t.bestSeller}
              checked={form.bestSeller}
              onCheckedChange={(bestSeller) => updateForm({ bestSeller })}
            />
            <ToggleField
              label={t.newlyArrived}
              checked={form.newlyArrived}
              onCheckedChange={(newlyArrived) => updateForm({ newlyArrived })}
            />
            <ToggleField
              label={t.isProductYouWillLove}
              checked={form.isProductYouWillLove}
              onCheckedChange={(isProductYouWillLove) =>
                updateForm({ isProductYouWillLove })
              }
            />
            {isSimple ? (
              <ToggleField
                label={t.hasDiscountPrice}
                checked={form.hasDiscountPrice}
                onCheckedChange={(hasDiscountPrice) => {
                  // Quick edit has no sale-price fields — only clear an existing discount,
                  // or keep one that already has a sale price from the full product form.
                  if (
                    hasDiscountPrice &&
                    (originalForm.priceDiscount == null ||
                      Number(originalForm.priceDiscount) <= 0)
                  ) {
                    return;
                  }
                  updateForm({ hasDiscountPrice });
                }}
              />
            ) : null}
            <ToggleField
              label={t.approveAddToCarePlan}
              checked={form.approveAddToCarePlan}
              onCheckedChange={(approveAddToCarePlan) =>
                updateForm({ approveAddToCarePlan })
              }
            />
          </div>

          <CrudFormFooter
            submitLabel={t.save}
            cancelLabel={t.cancel}
            onCancel={() => onOpenChange(false)}
            isLoading={isSaving}
            loadingLabel={t.loadingMessage}
          />
        </CrudFormShell>
      ) : null}
    </CrudEntityDrawer>
  );
}
