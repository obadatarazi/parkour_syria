import {
  areNumberArraysEqual,
  hasFormChanges,
  normalizedStringEqual,
  pickChangedScalar,
} from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type UserType = "ADMIN" | "CUSTOMER";
export type UserGender = "MALE" | "FEMALE";

export type AdminRole = {
  id: number;
  name: string;
};

export type AdminUser = {
  id: number;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  /** Dedicated WhatsApp number; null/undefined on list payloads. */
  whatsappPhoneNumber?: string | null;
  whatsappNotificationsEnabled?: boolean;
  gender?: { label: string; value: UserGender } | null;
  type?: { label: string; value: UserType } | null;
  avatarFileUrl?: string | null;
  dateOfBirth?: string | null;
  active?: boolean;
  roles?: AdminRole[];
  createdAt?: string;
};

export type UserListParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: UserType;
  active?: boolean;
};

export type UserFormData = {
  fullName: string;
  email?: string;
  phoneNumber: string;
  /** Empty string clears the dedicated WhatsApp number (use account phone). */
  whatsappPhoneNumber?: string;
  whatsappNotificationsEnabled?: boolean;
  password?: string;
  passwordConfirmation?: string;
  gender?: UserGender;
  type: UserType;
  dateOfBirth?: string;
  active?: boolean;
  roles: number[];
  avatar?: File | null;
};

export type UserListResult = PaginatedResult<AdminUser>;

export function createEmptyUserForm(defaultType: UserType = "CUSTOMER"): UserFormData {
  return {
    fullName: "",
    email: "",
    phoneNumber: "",
    whatsappPhoneNumber: "",
    whatsappNotificationsEnabled: false,
    password: "",
    passwordConfirmation: "",
    type: defaultType,
    dateOfBirth: "",
    active: true,
    roles: [],
    avatar: null,
  };
}

export function getUserDisplayName(user: {
  id: number;
  fullName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
}): string {
  return user.fullName?.trim() || user.phoneNumber?.trim() || user.email?.trim() || `#${user.id}`;
}

export function userToFormData(user: AdminUser): UserFormData {
  return {
    fullName: user.fullName ?? "",
    email: user.email ?? "",
    phoneNumber: user.phoneNumber ?? "",
    whatsappPhoneNumber: user.whatsappPhoneNumber ?? "",
    whatsappNotificationsEnabled: user.whatsappNotificationsEnabled ?? false,
    gender: user.gender?.value,
    type: user.type?.value ?? "CUSTOMER",
    dateOfBirth: user.dateOfBirth?.slice(0, 10) ?? "",
    active: user.active ?? true,
    roles: user.roles?.map((role) => role.id) ?? [],
    avatar: null,
  };
}

export function pickUserFormChanges(
  original: UserFormData,
  current: UserFormData,
): Partial<UserFormData> {
  const changes: Partial<UserFormData> = {
    ...pickChangedScalar(original, current, [
      "fullName",
      "phoneNumber",
      "whatsappPhoneNumber",
      "whatsappNotificationsEnabled",
      "gender",
      "type",
      "dateOfBirth",
      "active",
    ], (key, originalValue, currentValue) => {
      if (
        key === "fullName" ||
        key === "phoneNumber" ||
        key === "whatsappPhoneNumber" ||
        key === "dateOfBirth"
      ) {
        return !normalizedStringEqual(
          originalValue as string | undefined,
          currentValue as string | undefined,
        );
      }
      return originalValue !== currentValue;
    }),
  };

  if (!normalizedStringEqual(original.email, current.email)) {
    changes.email = current.email;
  }

  if (
    current.type === "ADMIN" &&
    !areNumberArraysEqual(original.roles, current.roles)
  ) {
    changes.roles = current.roles;
  }

  if (current.avatar instanceof File) {
    changes.avatar = current.avatar;
  }

  if (current.password?.trim()) {
    changes.password = current.password;
    changes.passwordConfirmation = current.passwordConfirmation;
  }

  return changes;
}

export function hasUserFormChanges(
  original: UserFormData,
  current: UserFormData,
): boolean {
  return hasFormChanges(pickUserFormChanges(original, current));
}
