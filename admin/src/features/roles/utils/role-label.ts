import type { Translation } from "@/shared/design-system/localization/locales/en";

/** The seeded roles (backend RoleSeeder) read as المدير / المشرف, custom roles keep their name. */
export function roleDisplayName(t: Translation, role: { name: string }): string {
  switch (role.name.trim().toLowerCase()) {
    case "super-admin":
      return t.roleSuperAdmin;
    case "supervisor":
      return t.roleSupervisor;
    default:
      return role.name;
  }
}
