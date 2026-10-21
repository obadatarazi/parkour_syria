import { useCallback } from "react";

import { prescriptionsService } from "@/features/prescriptions/services/prescriptions.service";
import type {
  Prescription,
  PrescriptionFormData,
} from "@/features/prescriptions/types/prescriptions.types";
import {
  hasPrescriptionFormChanges,
  pickPrescriptionFormChanges,
  PRESCRIPTION_STATUS,
  prescriptionToFormData,
} from "@/features/prescriptions/types/prescriptions.types";
import {
  type CrudSaveResult,
  invalidateQueryCache,
  setCachedQueryData,
  useCrudMutation,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UsePrescriptionMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

function cachePrescriptionDetail(prescription: Prescription) {
  setCachedQueryData(["prescriptions", "detail", String(prescription.id)], prescription);
}

function invalidatePrescriptionQueries() {
  invalidateQueryCache("prescriptions", { skipPrefix: "prescriptions:detail:" });
}

async function afterPrescriptionMutation(
  prescription?: Prescription,
  onSuccess?: () => void | Promise<void>,
) {
  invalidatePrescriptionQueries();
  if (prescription) {
    cachePrescriptionDetail(prescription);
  }
  await onSuccess?.();
}

export function usePrescriptionMutations({ onSuccess }: UsePrescriptionMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: PrescriptionFormData) => prescriptionsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async (prescription) => {
      await afterPrescriptionMutation(prescription, onSuccess);
    },
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PrescriptionFormData> }) =>
      prescriptionsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async (prescription) => {
      await afterPrescriptionMutation(prescription, onSuccess);
    },
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (entity: Prescription) => prescriptionsService.delete(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => {
      await afterPrescriptionMutation(undefined, onSuccess);
    },
  });

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: PrescriptionFormData,
      entity?: Prescription,
      originalForm?: PrescriptionFormData,
    ): Promise<{ status: CrudSaveResult; prescription?: Prescription } | undefined> => {
      if (mode === "create") {
        const result = await createMutation.mutate(data);
        if (!result.ok) return undefined;
        return { status: "saved" as const, prescription: result.data };
      }
      if (!entity) return undefined;

      const original = originalForm ?? prescriptionToFormData(entity);
      if (!hasPrescriptionFormChanges(original, data)) {
        return { status: "skipped" as const };
      }

      const result = await updateMutation.mutate({
        id: entity.id,
        data: pickPrescriptionFormChanges(original, data),
      });
      if (!result.ok) return undefined;
      return { status: "saved" as const, prescription: result.data };
    },
    [createMutation, updateMutation],
  );

  const quickUpdateStatus = useCallback(
    async (entity: Prescription, status: string) => {
      const original = prescriptionToFormData(entity);
      if (original.status === status) return { ok: true as const, data: entity };

      const next: PrescriptionFormData = {
        ...original,
        status,
        productIds: status === PRESCRIPTION_STATUS.APPROVED ? original.productIds : [],
      };

      const result = await updateMutation.mutate({
        id: entity.id,
        data: pickPrescriptionFormChanges(original, next),
      });
      if (!result.ok) return { ok: false as const };
      return { ok: true as const, data: result.data };
    },
    [updateMutation],
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    save,
    quickUpdateStatus,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isStatusUpdating: updateMutation.isPending,
  };
}
