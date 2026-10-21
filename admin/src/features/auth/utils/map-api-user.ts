import type { AuthRole, AuthUser } from "@/features/auth/types/auth.types";
import type { ApiRoleData, ApiUser } from "@/shared/lib/api";

export function mapApiRolesToAuthRoles(
  roles: ApiRoleData | ApiRoleData[] | null | undefined,
): AuthRole[] {
  if (!roles) return [];

  const roleList = Array.isArray(roles) ? roles : [roles];

  return roleList.map((role) => ({
    id: role.id,
    name: role.name,
    permissions: role.permission ?? role.permissions ?? [],
  }));
}

export function mapApiUserToAuthUser(
  user: ApiUser,
  options?: { roleName?: string; roles?: AuthRole[] },
): AuthUser {
  const roles = options?.roles ?? [];
  const roleName = options?.roleName ?? roles[0]?.name ?? user.type?.label ?? "Admin";

  return {
    id: user.id,
    name: user.fullName,
    email: user.email ?? "",
    phoneNumber: user.phoneNumber,
    role: roleName,
    roles,
    avatarFileUrl: user.avatarFileUrl,
    gender: (user.gender?.value as AuthUser["gender"]) ?? null,
    genderLabel: user.gender?.label ?? null,
    dateOfBirth: user.dateOfBirth ?? null,
    verifiedAt: user.verifiedAt ?? null,
    createdAt: user.createdAt ?? null,
    active: user.active,
  };
}

export function resolveRoleName(roles: AuthRole[]): string {
  return roles[0]?.name ?? "Admin";
}
