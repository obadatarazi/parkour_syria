import type { AuthUser } from "@/features/auth/types/auth.types";
import type { Translation } from "@/shared/design-system/localization/locales/en";
import { intlLocale } from "@/shared/lib/datetime.utils";

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: "" };
  }

  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}

export function formatMemberSince(
  createdAt: string | null | undefined,
  locale: "en" | "ar",
): string | null {
  if (!createdAt) return null;

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatProfileDate(
  value: string | null | undefined,
  locale: "en" | "ar",
): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function resolveGenderLabel(user: AuthUser, t: Translation): string {
  if (user.genderLabel) return user.genderLabel;
  if (user.gender === "MALE") return t.male;
  if (user.gender === "FEMALE") return t.female;
  return t.notSet;
}
