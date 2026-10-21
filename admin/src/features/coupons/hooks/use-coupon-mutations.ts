import { useCallback } from "react";

import { couponsService } from "@/features/coupons/services/coupons.service";
import type { Coupon, CouponFormData } from "@/features/coupons/types/coupons.types";
import {
  couponToFormData,
  hasCouponFormChanges,
  pickCouponFormChanges,
} from "@/features/coupons/types/coupons.types";
import {
  invalidateQueryCache,
  setCachedQueryData,
  useCrudMutation,
  type CrudSaveResult,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseCouponMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

function cacheCouponDetail(coupon: Coupon) {
  setCachedQueryData(["coupons", "detail", String(coupon.id)], coupon);
  if (coupon.code) {
    setCachedQueryData(["coupons", "detail", coupon.code], coupon);
  }
}

function invalidateCouponQueries() {
  invalidateQueryCache("coupons", { skipPrefix: "coupons:detail:" });
}

async function afterCouponMutation(coupon?: Coupon, onSuccess?: () => void | Promise<void>) {
  invalidateCouponQueries();
  if (coupon) {
    cacheCouponDetail(coupon);
  }
  await onSuccess?.();
}

export function useCouponMutations({ onSuccess }: UseCouponMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: CouponFormData) => couponsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async (coupon) => {
      await afterCouponMutation(coupon, onSuccess);
    },
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CouponFormData> }) =>
      couponsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async (coupon) => {
      await afterCouponMutation(coupon, onSuccess);
    },
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (entity: Coupon) => couponsService.delete(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => {
      await afterCouponMutation(undefined, onSuccess);
    },
  });

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: CouponFormData,
      entity?: Coupon,
      originalForm?: CouponFormData,
    ): Promise<{ status: CrudSaveResult; coupon?: Coupon } | undefined> => {
      if (mode === "create") {
        const result = await createMutation.mutate(data);
        if (!result.ok) return undefined;
        return { status: "saved" as const, coupon: result.data };
      }
      if (!entity) return undefined;

      const original = originalForm ?? couponToFormData(entity);
      if (!hasCouponFormChanges(original, data)) {
        return { status: "skipped" as const };
      }

      const result = await updateMutation.mutate({
        id: entity.id,
        data: pickCouponFormChanges(original, data),
      });
      if (!result.ok) return undefined;
      return { status: "saved" as const, coupon: result.data };
    },
    [createMutation, updateMutation],
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    save,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
