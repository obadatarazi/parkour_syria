import {
  areNumberArraysEqual,
  hasFormChanges,
  normalizedStringEqual,
  pickChangedScalar,
} from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type Role = {
  id: number;
  name: string;
  code?: string;
  standard?: boolean;
  /** Details / getById — full permission name list for the edit form. */
  permissions?: string[];
  /** Slim list — table shows this count instead of loading permissions[]. */
  permissionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type RoleListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  direction?: "asc" | "desc";
  code?: string;
};

export type RoleFormData = {
  name: string;
  standard?: boolean;
  permissions: number[];
};

export type RoleListResult = PaginatedResult<Role>;

export type PermissionOption = {
  id: number;
  role: string;
  name: string;
  description: string;
};

export type PermissionRecord = {
  id: number;
  name: string;
};

export type PermissionListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

export type PermissionListResult = PaginatedResult<PermissionRecord>;

export type PermissionSection = {
  section: string;
  roles: PermissionOption[];
};

export function createEmptyRoleForm(): RoleFormData {
  return {
    name: "",
    standard: false,
    permissions: [],
  };
}

export function roleToFormData(
  role: Role,
  permissionNameToId: Map<string, number>,
): RoleFormData {
  return {
    name: role.name,
    standard: role.standard ?? false,
    permissions:
      role.permissions
        ?.map((permissionName) => permissionNameToId.get(permissionName))
        .filter((id): id is number => id !== undefined) ?? [],
  };
}

/** Permission names on a role that are missing from the loaded name→id map. */
export function getUnmappedRolePermissionNames(
  role: Role,
  permissionNameToId: Map<string, number>,
): string[] {
  return (role.permissions ?? []).filter((permissionName) => !permissionNameToId.has(permissionName));
}

export function pickRoleFormChanges(
  original: RoleFormData,
  current: RoleFormData,
): Partial<RoleFormData> {
  const changes: Partial<RoleFormData> = {
    ...pickChangedScalar(original, current, ["standard"]),
  };

  if (!normalizedStringEqual(original.name, current.name)) {
    changes.name = current.name;
  }

  if (!areNumberArraysEqual(original.permissions, current.permissions)) {
    changes.permissions = current.permissions;
  }

  return changes;
}

export function hasRoleFormChanges(
  original: RoleFormData,
  current: RoleFormData,
): boolean {
  return hasFormChanges(pickRoleFormChanges(original, current));
}

export function buildPermissionNameToIdMap(
  sections: PermissionSection[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const section of sections) {
    for (const permission of section.roles) {
      map.set(permission.name, permission.id);
    }
  }
  return map;
}

export function buildPermissionNameToIdMapFromList(
  permissions: PermissionRecord[],
): Map<string, number> {
  return new Map(permissions.map((permission) => [permission.name, permission.id]));
}
