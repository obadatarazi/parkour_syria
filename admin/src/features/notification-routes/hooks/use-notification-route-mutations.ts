import { useCallback } from "react";

import { notificationRoutesService } from "@/features/notification-routes/services/notification-routes.service";
import type {
  NotificationRoute,
  NotificationRouteFormData,
} from "@/features/notification-routes/types/notification-routes.types";
import {
  hasNotificationRouteFormChanges,
  notificationRouteToFormData,
  pickNotificationRouteFormChanges,
} from "@/features/notification-routes/types/notification-routes.types";
import { type CrudSaveResult, invalidateQueryCache, useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseNotificationRouteMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useNotificationRouteMutations({
  onSuccess,
}: UseNotificationRouteMutationsOptions = {}) {
  const t = useTranslation();

  const refreshRelatedCaches = useCallback(async () => {
    invalidateQueryCache("notification-routes");
    await onSuccess?.();
  }, [onSuccess]);

  const updateMutation = useCrudMutation({
    mutationFn: ({ event, data }: { event: string; data: NotificationRouteFormData }) =>
      notificationRoutesService.update(event, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: refreshRelatedCaches,
  });

  const sendTestMutation = useCrudMutation({
    mutationFn: (event: string) => notificationRoutesService.sendTest(event),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.notificationRouteSendTestSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.notificationRouteSendTestLoading,
    },
  });

  const save = useCallback(
    async (
      event: string,
      data: NotificationRouteFormData,
      entity?: NotificationRoute,
    ): Promise<CrudSaveResult | undefined> => {
      if (!entity) return undefined;

      const original = notificationRouteToFormData(entity);
      if (!hasNotificationRouteFormChanges(original, data)) {
        return "skipped";
      }

      const changes = pickNotificationRouteFormChanges(original, data);
      await updateMutation.mutate({
        event,
        data: {
          recipients: changes.recipients ?? [],
        },
      });

      return "saved";
    },
    [updateMutation],
  );

  const sendTest = useCallback(
    async (event: string) => {
      await sendTestMutation.mutate(event);
    },
    [sendTestMutation],
  );

  return {
    updateMutation,
    sendTestMutation,
    save,
    sendTest,
    isSaving: updateMutation.isPending,
    isSendingTest: sendTestMutation.isPending,
  };
}
