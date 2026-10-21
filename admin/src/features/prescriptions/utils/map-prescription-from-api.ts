import type {
  Prescription,
  PrescriptionCustomer,
  PrescriptionEnumOption,
  PrescriptionProduct,
} from "@/features/prescriptions/types/prescriptions.types";

function mapEnumOption(
  option: { label?: string | null; value?: string | null } | string | null | undefined,
): PrescriptionEnumOption | null {
  if (option == null) return null;
  if (typeof option === "string") {
    return { label: option, value: option };
  }
  if (!option.value) return null;
  return {
    label: option.label ?? option.value,
    value: option.value,
  };
}

function toNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapCustomer(
  customer: PrescriptionCustomer | null | undefined,
): PrescriptionCustomer | null {
  if (!customer?.id) return null;
  return {
    id: toNumber(customer.id),
    fullName: customer.fullName ?? "",
    phoneNumber: customer.phoneNumber ?? null,
    email: customer.email ?? null,
    avatarFileUrl: customer.avatarFileUrl ?? null,
  };
}

function mapProduct(product: PrescriptionProduct): PrescriptionProduct {
  return {
    id: toNumber(product.id),
    title: product.title ?? "",
    slug: product.slug ?? null,
    imageFileUrl: product.imageFileUrl ?? null,
  };
}

export function mapPrescriptionFromApi(raw: Prescription): Prescription {
  const products = raw.products?.map(mapProduct);
  const productsCount = toNullableNumber(raw.productsCount);

  return {
    ...raw,
    id: toNumber(raw.id),
    prescriptionNumber: raw.prescriptionNumber ?? "",
    customer: mapCustomer(raw.customer),
    fileUrl: raw.fileUrl ?? null,
    status: mapEnumOption(raw.status),
    notes: raw.notes ?? null,
    productsCount: productsCount ?? products?.length ?? null,
    products,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}
