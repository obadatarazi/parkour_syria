import {
  hasFormChanges,
  pickChangedScalar,
} from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type ProductReviewCustomerRegistered = {
  id: number;
  fullName: string;
  phoneNumber?: string | null;
  avatarFileUrl?: string | null;
};

export type ProductReviewCustomerGuest = {
  userName: string;
};

export type ProductReviewCustomer = ProductReviewCustomerRegistered | ProductReviewCustomerGuest;

export type ProductReviewProduct = {
  id: number;
  title: string;
  featuredImageUrl?: string | null;
};

export type ProductReviewStatusValue = "PENDING" | "APPROVE" | "REJECT";

export type ProductReviewStatus = {
  label: string;
  value: ProductReviewStatusValue;
};

export type ProductReview = {
  id: number;
  product?: ProductReviewProduct;
  productId?: number;
  productTitle?: string;
  customer: ProductReviewCustomer | null;
  userName?: string | null;
  ratingStar: number;
  comment?: string | null;
  publish?: boolean;
  status?: ProductReviewStatus | ProductReviewStatusValue | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductReviewListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  ratingStar?: number;
  productId?: number;
  userId?: number;
  status?: ProductReviewStatusValue;
  sort?: string;
  direction?: "asc" | "desc";
};

export type ProductReviewFormData = {
  userName: string;
  ratingStar: number;
  comment: string;
  publish: boolean;
  status?: ProductReviewStatusValue;
};

export type ProductReviewCreateFormData = ProductReviewFormData & {
  productId: number | null;
};

export type ProductReviewListResult = PaginatedResult<ProductReview>;

export type ProductReviewRow = ProductReview & {
  productId: number;
  productTitle: string;
  productImageUrl?: string | null;
};

export type ProductReviewCatalogParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  ratingStar?: number;
  status?: ProductReviewStatusValue;
  sort?: string;
  direction?: "asc" | "desc";
};

export type ProductReviewCatalogResult = {
  rows: ProductReviewRow[];
  total: number;
  page: number;
  pageSize: number;
};

export function isRegisteredReviewCustomer(
  customer: ProductReviewCustomer | null,
): customer is ProductReviewCustomerRegistered {
  return customer != null && "id" in customer;
}

export function getReviewCustomerLabel(
  review: Pick<ProductReview, "customer" | "userName">,
): string {
  if (review.customer && isRegisteredReviewCustomer(review.customer)) {
    return review.customer.fullName || review.customer.phoneNumber || `#${review.customer.id}`;
  }

  if (review.customer && "userName" in review.customer) {
    return review.customer.userName;
  }

  return review.userName?.trim() || "—";
}

export function createEmptyProductReviewForm(): ProductReviewFormData {
  return {
    userName: "",
    ratingStar: 5,
    comment: "",
    publish: false,
  };
}

export function createEmptyProductReviewCreateForm(): ProductReviewCreateFormData {
  return {
    ...createEmptyProductReviewForm(),
    productId: null,
  };
}

export function productReviewToFormData(review: ProductReview): ProductReviewFormData {
  return {
    userName: getReviewCustomerLabel(review) === "—" ? "" : getReviewCustomerLabel(review),
    ratingStar: review.ratingStar,
    comment: review.comment ?? "",
    publish: review.publish ?? false,
  };
}

export function pickProductReviewFormChanges(
  original: ProductReviewFormData,
  current: ProductReviewFormData,
): Partial<ProductReviewFormData> {
  return pickChangedScalar(original, current, ["userName", "ratingStar", "comment", "publish"]);
}

export function hasProductReviewFormChanges(
  original: ProductReviewFormData,
  current: ProductReviewFormData,
): boolean {
  return hasFormChanges(pickProductReviewFormChanges(original, current));
}
