import { apiRequest, type LaravelEnumOption, type LaravelSuccessResponse } from "@/shared/lib/api";

export const OPTIONS_ENDPOINTS = {
  multiTypeSettingType: "/options/multi-type-settings/type",
  userGender: "/options/users/gender",
  userType: "/options/users/type",
  contactUsStatus: "/options/contact-us/status",
  notificationType: "/options/notifications/type",
  adminNotificationEvents: "/options/admin-notification-events",
  staticPromotionType: "/options/static-promotions/type",
  sliderPromotionType: "/options/slider-promotions/type",
  productType: "/options/products/type",
  productStatus: "/options/products/status",
  productExportAttributes: "/options/products/export-attributes",
  brands: "/options/brands",
  categories: "/options/categories",
  orderStatus: "/options/orders/status",
  orderCreatedBy: "/options/orders/created-by",
  orderSource: "/options/orders/source",
  invoiceStatus: "/options/invoices/status",
  invoicePaymentProvider: "/options/invoices/payment-provider",
  carePlanStatus: "/options/care-plans/status",
  carePlanFrequency: "/options/care-plans/frequency",
  carePlanCycleStatus: "/options/care-plans/cycle-status",
  carePlanEventType: "/options/care-plans/event-type",
  carePlanPreferredWeekday: "/options/care-plans/preferred-weekday",
  carePlanFailureReason: "/options/care-plans/failure-reason",
  trendingSearchTargetType: "/options/trending-searches/target-type",
} as const;

export type OptionsEndpoint = (typeof OPTIONS_ENDPOINTS)[keyof typeof OPTIONS_ENDPOINTS];

export async function fetchEnumOptions(
  endpoint: OptionsEndpoint,
  signal?: AbortSignal,
  params?: Record<string, string | number | boolean | undefined | null>,
): Promise<LaravelEnumOption[]> {
  const response = await apiRequest<LaravelSuccessResponse<LaravelEnumOption[]>>(endpoint, {
    skipAuth: true,
    signal,
    params,
  });
  return response.data;
}
