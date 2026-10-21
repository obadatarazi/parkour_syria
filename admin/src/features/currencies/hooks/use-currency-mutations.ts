import { useCallback } from "react";

import { currenciesService } from "@/features/currencies/services/currencies.service";
import type { Currency, CurrencyFormData } from "@/features/currencies/types/currencies.types";
import {
  currencyToFormData,
  hasCurrencyFormChanges,
  pickCurrencyFormChanges,
} from "@/features/currencies/types/currencies.types";
import { useCrudMutation, useCrudQuickBooleanMutation, type CrudSaveResult } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseCurrencyMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type CurrencyQuickToggleField = "publish" | "isDefault";

export function useCurrencyMutations({ onSuccess }: UseCurrencyMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: CurrencyFormData) => currenciesService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CurrencyFormData> }) =>
      currenciesService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (currency: Currency) => currenciesService.delete(currency.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => currenciesService.update(id, data),
  });

  const quickToggle = useCallback(
    (currency: Currency, field: CurrencyQuickToggleField, value: boolean) =>
      quickToggleField(currency.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: CurrencyFormData,
      entity?: Currency,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = currencyToFormData(entity);
      if (!hasCurrencyFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickCurrencyFormChanges(original, data),
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
