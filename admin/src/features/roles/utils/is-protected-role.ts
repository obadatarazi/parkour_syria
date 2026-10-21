import type { Role } from "@/features/roles/types/roles.types";

/**
 * System roles that must not be edited or deleted from the Admin UI. The backend's
 * `app:update-admin-roles` re-syncs super-admin and supervisor permissions on every deploy, so an
 * edit made here would be silently undone.
 */
const PROTECTED_ROLE_NAMES = new Set(["super-admin", "supervisor", "customer"]);
const PROTECTED_ROLE_CODES = new Set(["SUPER_ADMIN", "SUPERVISOR", "CUSTOMER"]);

export function isProtectedRole(role: Role): boolean {
  const name = role.name.trim().toLowerCase();
  if (PROTECTED_ROLE_NAMES.has(name)) return true;

  const code = role.code?.trim().toUpperCase();
  return code != null && PROTECTED_ROLE_CODES.has(code);
}
