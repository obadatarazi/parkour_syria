import { areNumberArraysEqual } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type PrescriptionFormSectionId = "customer" | "document" | "products";

export function parsePrescriptionFormSection(
  value: string | null | undefined,
): PrescriptionFormSectionId | undefined {
  if (value === "customer" || value === "document" || value === "products") {
    return value;
  }
  return undefined;
}

export const PRESCRIPTION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type PrescriptionStatusValue =
  (typeof PRESCRIPTION_STATUS)[keyof typeof PRESCRIPTION_STATUS];

export type PrescriptionEnumOption = {
  label: string | null;
  value: string | null;
};

export type PrescriptionCustomer = {
  id: number;
  fullName: string;
  phoneNumber?: string | null;
  email?: string | null;
  avatarFileUrl?: string | null;
};

export type PrescriptionProduct = {
  id: number;
  title: string;
  slug?: string | null;
  imageFileUrl?: string | null;
};

export type Prescription = {
  id: number;
  prescriptionNumber: string;
  customer?: PrescriptionCustomer | null;
  fileUrl?: string | null;
  status?: PrescriptionEnumOption | null;
  notes?: string | null;
  productsCount?: number | null;
  products?: PrescriptionProduct[];
  createdAt?: string;
  updatedAt?: string;
};

export type PrescriptionListParams = {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  prescriptionNumber?: string;
  status?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

export type PrescriptionListResult = PaginatedResult<Prescription>;

export type PrescriptionFormData = {
  userId: number | null;
  file: File | null;
  status: string;
  notes: string;
  productIds: number[];
};

export function createEmptyPrescriptionForm(): PrescriptionFormData {
  return {
    userId: null,
    file: null,
    status: PRESCRIPTION_STATUS.PENDING,
    notes: "",
    productIds: [],
  };
}

export function prescriptionToFormData(prescription: Prescription): PrescriptionFormData {
  return {
    userId: prescription.customer?.id ?? null,
    file: null,
    status: prescription.status?.value ?? PRESCRIPTION_STATUS.PENDING,
    notes: prescription.notes ?? "",
    productIds: (prescription.products ?? []).map((product) => product.id),
  };
}

export function pickPrescriptionFormChanges(
  original: PrescriptionFormData,
  current: PrescriptionFormData,
): Partial<PrescriptionFormData> {
  const changes: Partial<PrescriptionFormData> = {};

  if (current.file) {
    changes.file = current.file;
  }
  if (current.status !== original.status) {
    changes.status = current.status;
  }
  if (current.notes.trim() !== original.notes.trim()) {
    changes.notes = current.notes.trim();
  }
  if (!areNumberArraysEqual(original.productIds, current.productIds)) {
    changes.productIds = current.productIds;
  }

  return changes;
}

export function hasPrescriptionFormChanges(
  original: PrescriptionFormData,
  current: PrescriptionFormData,
): boolean {
  return Object.keys(pickPrescriptionFormChanges(original, current)).length > 0;
}

export function getPrescriptionCustomerLabel(
  prescription: Prescription,
  fallback: string,
): string {
  const name = prescription.customer?.fullName?.trim();
  return name || fallback;
}

export function isPrescriptionApproved(status?: string | null): boolean {
  return status === PRESCRIPTION_STATUS.APPROVED;
}

export function isPrescriptionRejected(status?: string | null): boolean {
  return status === PRESCRIPTION_STATUS.REJECTED;
}
