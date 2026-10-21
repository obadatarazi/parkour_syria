import type { AuthRole, AuthUser } from "@/features/auth/types/auth.types";
import { MOCK_SUPER_ADMIN_PERMISSIONS } from "@/shared/constants/permissions";

export function createMockAuthUser(email: string): AuthUser {
  const roles: AuthRole[] = [
    {
      id: 1,
      name: "Super Admin",
      permissions: [...MOCK_SUPER_ADMIN_PERMISSIONS],
    },
  ];

  return {
    id: 1,
    name: "Admin User",
    email,
    role: roles[0]?.name ?? "Super Admin",
    roles,
  };
}
