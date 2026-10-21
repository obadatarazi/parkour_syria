import { useCallback } from "react";

import { customersService } from "@/features/customers/services/customers.service";
import type {
  CrmAssignCouponInput,
  CrmCustomer,
  CrmProfileInput,
  CrmSendNotificationInput,
} from "@/features/customers/types/customers.types";
import {
  invalidateQueryCache,
  setCachedQueryData,
  useCrudMutation,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

function refreshCrm(customer?: CrmCustomer) {
  invalidateQueryCache("crm-customers", { skipPrefix: "crm-customers:detail:" });
  invalidateQueryCache("crm-stats");
  invalidateQueryCache("crm-report");
  if (customer) {
    setCachedQueryData(["crm-customers", "detail", String(customer.id)], customer);
  }
}

type UseCustomerMutationsOptions = {
  onSuccess?: (customer: CrmCustomer) => void | Promise<void>;
};

export function useCustomerMutations({ onSuccess }: UseCustomerMutationsOptions = {}) {
  const t = useTranslation();

  const after = useCallback(
    async (customer: CrmCustomer) => {
      refreshCrm(customer);
      await onSuccess?.(customer);
    },
    [onSuccess],
  );

  const updateProfile = useCrudMutation({
    mutationFn: ({ id, input }: { id: number; input: CrmProfileInput }) =>
      customersService.update(id, input),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crmProfileUpdated,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: after,
  });

  const toggleVip = useCrudMutation({
    mutationFn: (customer: CrmCustomer) => customersService.toggleVip(customer.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crmTagsUpdated,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: after,
  });

  const assignCoupon = useCrudMutation({
    mutationFn: ({ id, input }: { id: number; input: CrmAssignCouponInput }) =>
      customersService.assignCoupon(id, input),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crmCouponAssigned,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: after,
  });

  const sendNotification = useCrudMutation({
    mutationFn: ({ id, input }: { id: number; input: CrmSendNotificationInput }) =>
      customersService.sendNotification(id, input),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crmNotificationSent,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: after,
  });

  const pauseCarePlan = useCrudMutation({
    mutationFn: (customer: CrmCustomer) => customersService.pauseCarePlan(customer.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crmCarePlanUpdated,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: after,
  });

  const resumeCarePlan = useCrudMutation({
    mutationFn: (customer: CrmCustomer) => customersService.resumeCarePlan(customer.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crmCarePlanUpdated,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: after,
  });

  return {
    updateProfile,
    toggleVip,
    assignCoupon,
    sendNotification,
    pauseCarePlan,
    resumeCarePlan,
  };
}
