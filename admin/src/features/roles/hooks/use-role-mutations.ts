import { useCallback } from "react";

import { usePermissionsList } from "@/features/roles/hooks/use-permissions-list";
import { rolesService } from "@/features/roles/services/roles.service";
import type { Role, RoleFormData } from "@/features/roles/types/roles.types";
import {
  getUnmappedRolePermissionNames,
  hasRoleFormChanges,
  pickRoleFormChanges,
  roleToFormData,
} from "@/features/roles/types/roles.types";
import { type CrudSaveResult,useCrudMutation, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { notify } from "@/shared/lib/notifications";

export function usePermissionsBySection() {
  return useCrudQuery({
    queryKey: ["roles", "permissions-by-section"],
    queryFn: () => rolesService.getPermissionsBySection(),
  });
}

type UseRoleMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useRoleMutations({ onSuccess }: UseRoleMutationsOptions = {}) {
  const t = useTranslation();
  const { permissionNameToId, isComplete: isPermissionsComplete } = usePermissionsList();

  const createMutation = useCrudMutation({
    mutationFn: (data: RoleFormData) => rolesService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RoleFormData> }) =>
      rolesService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (role: Role) => rolesService.delete(role.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: RoleFormData,
      entity?: Role,
    ): Promise<CrudSaveResult | undefined> => {
      // Never persist role permissions against a partial name→id map.
      if (!isPermissionsComplete) {
        notify.error(t.errorMessage, t.permissionsLoadFailed);
        return undefined;
      }

      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      // Block if any role permission name cannot be mapped (would silently drop on sync).
      if (getUnmappedRolePermissionNames(entity, permissionNameToId).length > 0) {
        notify.error(t.errorMessage, t.permissionsLoadFailed);
        return undefined;
      }

      const original = roleToFormData(entity, permissionNameToId);
      if (!hasRoleFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickRoleFormChanges(original, data),
      });
      return "saved";
    },
    [createMutation, isPermissionsComplete, permissionNameToId, t, updateMutation],
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
