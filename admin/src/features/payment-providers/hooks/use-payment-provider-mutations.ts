import { useCallback } from "react";

import { paymentProvidersService } from "@/features/payment-providers/services/payment-providers.service";
import type {
  PaymentProvider,
  PaymentProviderFormData,
} from "@/features/payment-providers/types/payment-providers.types";
import {
  hasPaymentProviderFormChanges,
  paymentProviderToFormData,
  pickPaymentProviderFormChanges,
} from "@/features/payment-providers/types/payment-providers.types";
import { useCrudMutation, useCrudQuickBooleanMutation, type CrudSaveResult } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UsePaymentProviderMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type PaymentProviderQuickToggleField = "publish" | "standard";

export function usePaymentProviderMutations({
  onSuccess,
}: UsePaymentProviderMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: PaymentProviderFormData) => paymentProvidersService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PaymentProviderFormData> }) =>
      paymentProvidersService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (provider: PaymentProvider) => paymentProvidersService.delete(provider.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => paymentProvidersService.update(id, data),
  });

  const quickToggle = useCallback(
    (provider: PaymentProvider, field: PaymentProviderQuickToggleField, value: boolean) =>
      quickToggleField(provider.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: PaymentProviderFormData,
      entity?: PaymentProvider,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = paymentProviderToFormData(entity);
      if (!hasPaymentProviderFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickPaymentProviderFormChanges(original, data),
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
    save,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
