import type {
  Coupon,
  CouponFormData,
  CouponScopeValue,
  CouponUserFormItem,
} from "@/features/coupons/types/coupons.types";

const CATALOG_KINDS = ["PRODUCT", "BRAND", "CATEGORY", "TAG"] as const;

export function hasCatalogBindings(
  form: Pick<
    CouponFormData,
    "productIds" | "productVariantIds" | "brandIds" | "categoryIds" | "tagIds"
  >,
): boolean {
  return (
    form.productIds.length > 0 ||
    form.productVariantIds.length > 0 ||
    form.brandIds.length > 0 ||
    form.categoryIds.length > 0 ||
    form.tagIds.length > 0
  );
}

export function inferCouponScope(coupon: Coupon | CouponFormData): CouponScopeValue {
  if ("scope" in coupon && typeof coupon.scope === "string") {
    if (coupon.scope === "CART" || coupon.scope === "ITEMS" || coupon.scope === "SHIPPING") {
      return coupon.scope;
    }
  }

  if ("scope" in coupon && coupon.scope && typeof coupon.scope === "object") {
    const value = coupon.scope.value;
    if (value === "CART" || value === "ITEMS" || value === "SHIPPING") {
      return value;
    }
  }

  const type =
    "type" in coupon && typeof coupon.type === "string"
      ? coupon.type
      : "type" in coupon && coupon.type && typeof coupon.type === "object"
        ? coupon.type.value
        : undefined;

  if (type === "FREE_SHIPPING") return "SHIPPING";

  if ("productIds" in coupon) {
    return hasCatalogBindings(coupon) ? "ITEMS" : "CART";
  }

  const hasCatalog =
    (coupon.products?.length ?? 0) > 0 ||
    (coupon.productVariants?.length ?? 0) > 0 ||
    (coupon.brands?.length ?? 0) > 0 ||
    (coupon.categories?.length ?? 0) > 0 ||
    (coupon.tags?.length ?? 0) > 0;

  return hasCatalog ? "ITEMS" : "CART";
}

function emptyCatalog(): Pick<
  CouponFormData,
  "productIds" | "productVariantIds" | "brandIds" | "categoryIds" | "tagIds"
> {
  return {
    productIds: [],
    productVariantIds: [],
    brandIds: [],
    categoryIds: [],
    tagIds: [],
  };
}

function namedUsers(users: CouponUserFormItem[]): CouponUserFormItem[] {
  return users.filter((user) => user.userId != null);
}

function catalogApplicableTo(form: CouponFormData): string[] {
  return CATALOG_KINDS.filter((kind) => {
    if (kind === "PRODUCT") {
      return form.productIds.length > 0 || form.productVariantIds.length > 0;
    }
    if (kind === "BRAND") return form.brandIds.length > 0;
    if (kind === "CATEGORY") return form.categoryIds.length > 0;
    return form.tagIds.length > 0;
  });
}

/**
 * Maps the admin form onto the origin/dev coupon contract:
 * scope CART | ITEMS | SHIPPING, catalog-only applicableTo, users only for SPECIFIC_USERS.
 */
export function normalizeCouponFormForApi(form: CouponFormData): CouponFormData {
  const isSpecificUsers = form.audience === "SPECIFIC_USERS";
  const users = isSpecificUsers ? namedUsers(form.users) : [];

  if (form.type === "FREE_SHIPPING" || form.scope === "SHIPPING") {
    const applicableTo = catalogApplicableTo(form);
    return {
      ...form,
      type: "FREE_SHIPPING",
      scope: "SHIPPING",
      value: "",
      applicableTo,
      productIds: applicableTo.includes("PRODUCT") ? form.productIds : [],
      productVariantIds: applicableTo.includes("PRODUCT") ? form.productVariantIds : [],
      brandIds: applicableTo.includes("BRAND") ? form.brandIds : [],
      categoryIds: applicableTo.includes("CATEGORY") ? form.categoryIds : [],
      tagIds: applicableTo.includes("TAG") ? form.tagIds : [],
      users,
    };
  }

  if (form.scope === "CART") {
    return {
      ...form,
      scope: "CART",
      applicableTo: [],
      ...emptyCatalog(),
      users,
    };
  }

  const applicableTo = catalogApplicableTo(form);

  return {
    ...form,
    scope: "ITEMS",
    applicableTo,
    productIds: applicableTo.includes("PRODUCT") ? form.productIds : [],
    productVariantIds: applicableTo.includes("PRODUCT") ? form.productVariantIds : [],
    brandIds: applicableTo.includes("BRAND") ? form.brandIds : [],
    categoryIds: applicableTo.includes("CATEGORY") ? form.categoryIds : [],
    tagIds: applicableTo.includes("TAG") ? form.tagIds : [],
    users,
  };
}
