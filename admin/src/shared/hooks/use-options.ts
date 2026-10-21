import { useMemo } from "react";

import {
  resolveStaticEnumOptions,
  type StaticEnumOptionsKey,
} from "@/shared/constants/static-enum-options";
import { useCrudQuery } from "@/shared/crud";
import { useLocalization } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { fetchEnumOptions, OPTIONS_ENDPOINTS } from "@/shared/services/options-api.service";

export type SelectOption = {
  label: string;
  value: string;
};

function useStaticEnumOptions(key: StaticEnumOptionsKey) {
  const { language } = useLocalization();

  const options = useMemo(
    () => resolveStaticEnumOptions(key, language === "ar" ? "ar" : "en"),
    [key, language],
  );

  return {
    data: options,
    options,
    error: null as Error | null,
    status: "success" as const,
    isLoading: false,
    isFetching: false,
    isError: false,
    isSuccess: true,
    refetch: async () => undefined,
    patchData: () => undefined,
  };
}

export function useMultiTypeSettingTypeOptions() {
  return useStaticEnumOptions("multiTypeSettingType");
}

export function useUserGenderOptions() {
  return useStaticEnumOptions("userGender");
}

export function useUserTypeOptions() {
  return useStaticEnumOptions("userType");
}

export function useContactUsStatusOptions() {
  return useStaticEnumOptions("contactUsStatus");
}

export function useNotificationTypeOptions() {
  return useStaticEnumOptions("notificationType");
}

export function useStaticPromotionTypeOptions() {
  return useStaticEnumOptions("staticPromotionType");
}

export function useSliderPromotionTypeOptions() {
  return useStaticEnumOptions("sliderPromotionType");
}

export function useProductTypeOptions() {
  return useStaticEnumOptions("productType");
}

export function useProductStatusOptions() {
  return useStaticEnumOptions("productStatus");
}

export function useOrderStatusOptions() {
  return useStaticEnumOptions("orderStatus");
}

export function useOrderCreatedByOptions() {
  return useStaticEnumOptions("orderCreatedBy");
}

export function useOrderSourceOptions() {
  return useStaticEnumOptions("orderSource");
}

export function useInvoiceStatusOptions() {
  return useStaticEnumOptions("invoiceStatus");
}

export function useInvoicePaymentProviderOptions() {
  const { language } = useLocalization();
  const locale = language === "ar" ? "ar" : "en";

  const staticOptions = useMemo(
    () => resolveStaticEnumOptions("invoicePaymentProvider", locale),
    [locale],
  );

  const query = useCrudQuery({
    queryKey: ["options", "invoice-payment-provider"],
    queryFn: (signal) => fetchEnumOptions(OPTIONS_ENDPOINTS.invoicePaymentProvider, signal),
    staleTime: 5 * 60 * 1000,
  });

  const options = query.isSuccess && query.data && query.data.length > 0
    ? query.data.map((item) => ({ value: item.value, label: item.label }))
    : staticOptions;

  return {
    data: options,
    options,
    error: query.error,
    status: query.status,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    patchData: query.patchData,
  };
}

export function useCouponTypeOptions() {
  return useStaticEnumOptions("couponType");
}

export function useCouponStatusOptions() {
  return useStaticEnumOptions("couponStatus");
}

export function useCouponAudienceOptions() {
  return useStaticEnumOptions("couponAudience");
}

export function useCouponApplicableToOptions() {
  return useStaticEnumOptions("couponApplicableTo");
}

export function useCouponScopeOptions() {
  return useStaticEnumOptions("couponScope");
}

export function useCarePlanStatusOptions() {
  return useStaticEnumOptions("carePlanStatus");
}

export function usePrescriptionStatusOptions() {
  return useStaticEnumOptions("prescriptionStatus");
}

export function useStaffNoteTypeOptions() {
  return useStaticEnumOptions("staffNoteType");
}

export function useCarePlanFrequencyOptions() {
  return useStaticEnumOptions("carePlanFrequency");
}

export function useCarePlanPreferredWeekdayOptions() {
  return useStaticEnumOptions("carePlanPreferredWeekday");
}

export function useCarePlanCycleStatusOptions() {
  return useStaticEnumOptions("carePlanCycleStatus");
}

export function useCarePlanEventTypeOptions() {
  return useStaticEnumOptions("carePlanEventType");
}

export function useCarePlanFailureReasonOptions() {
  return useStaticEnumOptions("carePlanFailureReason");
}

export function useTrendingSearchTargetTypeOptions() {
  return useStaticEnumOptions("trendingSearchTargetType");
}

export function useLoyaltyEventTypeOptions() {
  return useStaticEnumOptions("loyaltyEventType");
}

export function useLoyaltyRewardTypeOptions() {
  return useStaticEnumOptions("loyaltyRewardType");
}

export function useLoyaltyLedgerTypeOptions() {
  return useStaticEnumOptions("loyaltyLedgerType");
}

export function useLoyaltyRedemptionStatusOptions() {
  return useStaticEnumOptions("loyaltyRedemptionStatus");
}

export function usePromotionTypeOptions() {
  return useStaticEnumOptions("promotionType");
}

export function usePromotionDiscountTypeOptions() {
  return useStaticEnumOptions("promotionDiscountType");
}
