import {
  hasFormChanges,
  normalizedStringEqual,
  pickChangedScalar,
} from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type ContactUsStatus = "PENDING" | "REVIEWED";

export type ContactUsStatusOption = {
  label: string;
  value: ContactUsStatus;
};

export type ContactUsMessage = {
  id: number;
  userFullName: string;
  userEmail: string;
  userPhoneNumber?: string | null;
  message: string;
  status?: ContactUsStatusOption | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ContactUsListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContactUsStatus;
  sort?: string;
  direction?: "asc" | "desc";
};

export type ContactUsFormData = {
  status: ContactUsStatus;
};

export type ContactUsListResult = PaginatedResult<ContactUsMessage>;

export function createEmptyContactUsForm(): ContactUsFormData {
  return { status: "PENDING" };
}

export function contactUsToFormData(message: ContactUsMessage): ContactUsFormData {
  return {
    status: message.status?.value ?? "PENDING",
  };
}

export function pickContactUsFormChanges(
  original: ContactUsFormData,
  current: ContactUsFormData,
): Partial<ContactUsFormData> {
  return pickChangedScalar(original, current, ["status"], (_key, a, b) =>
    !normalizedStringEqual(String(a), String(b)),
  );
}

export function hasContactUsFormChanges(
  original: ContactUsFormData,
  current: ContactUsFormData,
): boolean {
  return hasFormChanges(pickContactUsFormChanges(original, current));
}
