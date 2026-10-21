import { AbilityBuilder, createMongoAbility } from "@casl/ability";

import type { AppAbility } from "@/features/auth/ability/types";
import { expandManagePermissions, PERMISSIONS } from "@/shared/constants/permissions";

// Permission strings come from the API; only names the dashboard knows reach CASL.
// Must match Backend/app/Constant/PermissionType.php: when the backend adds a
// permission, add it to PERMISSIONS too or the dashboard will ignore it.
const KNOWN_PERMISSIONS: ReadonlySet<string> = new Set(Object.values(PERMISSIONS));

function isKnownPermission(value: unknown): value is string {
  return typeof value === "string" && KNOWN_PERMISSIONS.has(value);
}

export function createAbility(permissions: string[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
  const effectivePermissions = expandManagePermissions(permissions.filter(isKnownPermission));

  for (const permission of effectivePermissions) {
    can(permission, "all");
  }

  return build();
}

export function collectUserPermissions(roles: { permissions: string[] }[] | undefined): string[] {
  if (!roles?.length) return [];
  return roles.flatMap((role) => role.permissions ?? []);
}
