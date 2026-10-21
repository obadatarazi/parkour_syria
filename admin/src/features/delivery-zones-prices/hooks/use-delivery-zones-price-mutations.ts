import { useCallback, useRef, useState } from "react";

import { deliveryZonesPricesService } from "@/features/delivery-zones-prices/services/delivery-zones-prices.service";
import type {
  DeliveryZonesPrice,
  DeliveryZonesPriceFormData,
} from "@/features/delivery-zones-prices/types/delivery-zones-prices.types";
import {
  deliveryZonesPriceToFormData,
  hasDeliveryZonesPriceFormChanges,
  pickDeliveryZonesPriceFormChanges,
} from "@/features/delivery-zones-prices/types/delivery-zones-prices.types";
import { useCrudMutation, useCrudQuickBooleanMutation, type CrudSaveResult } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { getServiceErrorCode, resolveServiceErrorMessage } from "@/shared/errors";
import { notify } from "@/shared/lib/notifications";

type UseDeliveryZonesPriceMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type DeliveryZonesPriceQuickToggleField = "publish";

export function useDeliveryZonesPriceMutations({
  onSuccess,
}: UseDeliveryZonesPriceMutationsOptions = {}) {
  const t = useTranslation();
  const [savingFeeIds, setSavingFeeIds] = useState<Set<number>>(() => new Set());
  const savingFeeIdsRef = useRef(savingFeeIds);
  savingFeeIdsRef.current = savingFeeIds;

  const createMutation = useCrudMutation({
    mutationFn: (data: DeliveryZonesPriceFormData) => deliveryZonesPricesService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DeliveryZonesPriceFormData> }) =>
      deliveryZonesPricesService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (entity: DeliveryZonesPrice) => deliveryZonesPricesService.delete(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => deliveryZonesPricesService.update(id, data),
  });

  const quickToggle = useCallback(
    (entity: DeliveryZonesPrice, field: DeliveryZonesPriceQuickToggleField, value: boolean) =>
      quickToggleField(entity.id, field, value),
    [quickToggleField],
  );

  const quickUpdateFee = useCallback(
    async (entity: DeliveryZonesPrice, deliveryFee: number): Promise<boolean> => {
      if (savingFeeIdsRef.current.has(entity.id)) return false;

      setSavingFeeIds((current) => {
        const next = new Set(current);
        next.add(entity.id);
        return next;
      });

      try {
        await deliveryZonesPricesService.update(entity.id, { deliveryFee });
        return true;
      } catch (caughtError) {
        const error = caughtError instanceof Error ? caughtError : new Error("Update failed");
        if (getServiceErrorCode(error) !== "session_expired") {
          notify.error(t.errorMessage, resolveServiceErrorMessage(error, t));
        }
        return false;
      } finally {
        setSavingFeeIds((current) => {
          const next = new Set(current);
          next.delete(entity.id);
          return next;
        });
      }
    },
    [t],
  );

  const isFeeSaving = useCallback(
    (id: number) => savingFeeIds.has(id),
    [savingFeeIds],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: DeliveryZonesPriceFormData,
      entity?: DeliveryZonesPrice,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = deliveryZonesPriceToFormData(entity);
      if (!hasDeliveryZonesPriceFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickDeliveryZonesPriceFormChanges(original, data),
      });
      return "saved";
    },
    [createMutation, updateMutation],
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    quickToggle,
    quickUpdateFee,
    isFeeSaving,
    save,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
