import { useCallback } from "react";

import { usersService } from "@/features/users/services/users.service";
import type { AdminUser, UserFormData } from "@/features/users/types/users.types";
import {
  hasUserFormChanges,
  pickUserFormChanges,
  userToFormData,
} from "@/features/users/types/users.types";
import { type CrudSaveResult,useCrudMutation, useCrudQuickBooleanMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseUserMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type UserQuickToggleField = "active";

export function useUserMutations({ onSuccess }: UseUserMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: UserFormData) => usersService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormData> }) =>
      usersService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (user: AdminUser) => usersService.delete(user.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => usersService.update(id, data),
  });

  const quickToggle = useCallback(
    (user: AdminUser, field: UserQuickToggleField, value: boolean) =>
      quickToggleField(user.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: UserFormData,
      entity?: AdminUser,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = userToFormData(entity);
      if (!hasUserFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickUserFormChanges(original, data),
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
