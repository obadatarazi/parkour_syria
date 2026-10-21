import { useCallback } from "react";

import { countriesService } from "@/features/countries/services/countries.service";
import type { Country, CountryFormData } from "@/features/countries/types/countries.types";
import {
  countryToFormData,
  hasCountryFormChanges,
  pickCountryFormChanges,
} from "@/features/countries/types/countries.types";
import { type CrudSaveResult,useCrudMutation, useCrudQuickBooleanMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseCountryMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type CountryQuickToggleField = "publish";

export function useCountryMutations({ onSuccess }: UseCountryMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: CountryFormData) => countriesService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CountryFormData> }) =>
      countriesService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (country: Country) => countriesService.delete(country.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => countriesService.update(id, data),
  });

  const quickToggle = useCallback(
    (country: Country, field: CountryQuickToggleField, value: boolean) =>
      quickToggleField(country.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: CountryFormData,
      entity?: Country,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = countryToFormData(entity);
      if (!hasCountryFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickCountryFormChanges(original, data),
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
