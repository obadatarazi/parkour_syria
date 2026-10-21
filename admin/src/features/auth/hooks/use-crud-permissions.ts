import { useMemo } from "react";

import { useAbility } from "@/features/auth/ability/AbilityContext";
import {
  getCrudPermissionsForManage,
  type Permission,
} from "@/shared/constants/permissions";

export type CrudPermissionFlags = {
  canManage: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canShow: boolean;
};

export function useCrudPermissions(managePermission: Permission): CrudPermissionFlags {
  const ability = useAbility();

  return useMemo(() => {
    const crud = getCrudPermissionsForManage(managePermission);

    return {
      canManage: ability.can(crud.manage, "all"),
      canCreate: ability.can(crud.create, "all"),
      canUpdate: ability.can(crud.update, "all"),
      canDelete: ability.can(crud.delete, "all"),
      canShow: ability.can(crud.show, "all"),
    };
  }, [ability, managePermission]);
}
