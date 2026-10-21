import { useCallback } from "react";

import { trendingSearchesService } from "@/features/trending-searches/services/trending-searches.service";
import type {
  TrendingSearch,
  TrendingSearchFormData,
} from "@/features/trending-searches/types/trending-searches.types";
import {
  hasTrendingSearchFormChanges,
  pickTrendingSearchFormChanges,
  trendingSearchToFormData,
} from "@/features/trending-searches/types/trending-searches.types";
import { useCrudMutation, useCrudQuickBooleanMutation, type CrudSaveResult } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseTrendingSearchMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type TrendingSearchQuickToggleField = "publish";

export function useTrendingSearchMutations({ onSuccess }: UseTrendingSearchMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: TrendingSearchFormData) => trendingSearchesService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TrendingSearchFormData> }) =>
      trendingSearchesService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (item: TrendingSearch) => trendingSearchesService.delete(item.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => trendingSearchesService.update(id, data),
  });

  const quickToggle = useCallback(
    (item: TrendingSearch, field: TrendingSearchQuickToggleField, value: boolean) =>
      quickToggleField(item.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: TrendingSearchFormData,
      entity?: TrendingSearch,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = trendingSearchToFormData(entity);
      if (!hasTrendingSearchFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickTrendingSearchFormChanges(original, data),
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
