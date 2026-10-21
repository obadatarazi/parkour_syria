import { useCallback } from "react";

import { productsService } from "@/features/products/services/products.service";
import type { Product, ProductFormData } from "@/features/products/types/products.types";
import {
  hasProductFormChanges,
  pickProductFormChanges,
  productToFormData,
} from "@/features/products/types/products.types";
import { buildProductDuplicateFormData } from "@/features/products/utils/build-product-duplicate-form";
import {
  type CrudSaveResult,
  invalidateQueryCache,
  useCrudMutation,
  useCrudQuickBooleanMutation,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseProductMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type ProductQuickToggleField =
  | "publish"
  | "featured"
  | "bestSeller"
  | "newlyArrived"
  | "isProductYouWillLove";

function invalidateProductQueries() {
  invalidateQueryCache("products", { skipPrefix: "products:detail:" });
  invalidateQueryCache("products-trashed");
  invalidateQueryCache("products-tab-count");
  invalidateQueryCache("products-trashed-tab-count");
}

export function useProductMutations({ onSuccess }: UseProductMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: ProductFormData) => productsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => {
      invalidateProductQueries();
      await onSuccess?.();
    },
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data, type }: { id: number; data: Partial<ProductFormData>; type?: Product["type"] }) =>
      productsService.update(id, data, { type }),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => {
      invalidateProductQueries();
      await onSuccess?.();
    },
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (product: Product) => productsService.delete(product.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.productMoveToTrashSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => {
      invalidateProductQueries();
      await onSuccess?.();
    },
  });

  const restoreMutation = useCrudMutation({
    mutationFn: (product: Product) => productsService.restore(product.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.productRestoreSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => {
      invalidateProductQueries();
      await onSuccess?.();
    },
  });

  const forceDeleteMutation = useCrudMutation({
    mutationFn: (product: Product) => productsService.forceDelete(product.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.productForceDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => {
      invalidateProductQueries();
      await onSuccess?.();
    },
  });

  const duplicateMutation = useCrudMutation({
    mutationFn: async (product: Product) => {
      const fullProduct = await productsService.getById(product.id);
      const duplicateForm = buildProductDuplicateFormData(fullProduct);
      return productsService.create(duplicateForm);
    },
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.productDuplicateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.productDuplicateLoading,
    },
    onSuccess: async () => {
      invalidateProductQueries();
      await onSuccess?.();
    },
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => productsService.update(id, data),
  });

  const quickToggle = useCallback(
    (product: Product, field: ProductQuickToggleField, value: boolean) =>
      quickToggleField(product.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: ProductFormData,
      entity?: Product,
      originalForm?: ProductFormData,
    ): Promise<{ status: CrudSaveResult; product?: Product } | undefined> => {
      if (mode === "create") {
        const result = await createMutation.mutate(data);
        if (!result.ok) return undefined;
        return { status: "saved" as const, product: result.data };
      }
      if (!entity) return undefined;

      const original = originalForm ?? productToFormData(entity);
      if (!hasProductFormChanges(original, data)) {
        return { status: "skipped" as const };
      }

      const result = await updateMutation.mutate({
        id: entity.id,
        data: pickProductFormChanges(original, data),
        type: entity.type,
      });
      if (!result.ok) return undefined;
      return { status: "saved" as const, product: result.data };
    },
    [createMutation, updateMutation],
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    restoreMutation,
    forceDeleteMutation,
    duplicateMutation,
    quickToggle,
    save,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRestoring: restoreMutation.isPending,
    isForceDeleting: forceDeleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  };
}
