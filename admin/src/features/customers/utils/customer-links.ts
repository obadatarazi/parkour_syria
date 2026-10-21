import { customerCrmPath, ROUTES } from "@/app/router/routes";

export function customerCrmHref(userId: number | null | undefined): string | null {
  if (userId == null || !Number.isFinite(userId) || userId <= 0) return null;
  return customerCrmPath(userId);
}

function listHref(route: string, userId: number): string {
  return `${route}?userId=${userId}`;
}

export function customerOrdersListHref(userId: number): string {
  return listHref(ROUTES.admin.orders, userId);
}

export function customerPrescriptionsListHref(userId: number): string {
  return listHref(ROUTES.admin.prescriptions, userId);
}

export function customerProductReviewsListHref(userId: number): string {
  return listHref(ROUTES.admin.productReviews, userId);
}

export function customerCarePlansListHref(userId: number): string {
  return listHref(ROUTES.admin.carePlans, userId);
}
