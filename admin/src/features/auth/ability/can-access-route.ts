import type { AppAbility } from "@/features/auth/ability/types";
import { getCrudPermissionsForManage, type Permission } from "@/shared/constants/permissions";

/**
 * Check whether the user can access a route mapped to a MANAGE_* permission.
 * Mirrors backend index/show middleware: MANAGE_* or any view/update/delete grant.
 */
export function canAccessRoute(ability: AppAbility, managePermission: Permission): boolean {
  if (ability.can(managePermission, "all")) return true;

  const { show, update, delete: deletePermission } = getCrudPermissionsForManage(managePermission);

  return (
    ability.can(show, "all") ||
    ability.can(update, "all") ||
    ability.can(deletePermission, "all")
  );
}

export function canAccessAnyRoute(ability: AppAbility, permissions: Permission[]): boolean {
  return permissions.some((permission) => canAccessRoute(ability, permission));
}

export function canAccessNavItem(
  ability: AppAbility,
  item: { permission?: Permission; permissions?: Permission[] },
): boolean {
  if (item.permissions?.length) {
    return canAccessAnyRoute(ability, item.permissions);
  }
  if (item.permission) {
    return canAccessRoute(ability, item.permission);
  }
  return true;
}
