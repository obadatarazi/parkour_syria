import { useCallback } from "react";

import { meNotificationsService } from "@/features/notifications/services/me-notifications.service";
import { notificationsService } from "@/features/notifications/services/notifications.service";
import type {
  Notification,
  NotificationFormData,
} from "@/features/notifications/types/notifications.types";
import {
  hasNotificationFormChanges,
  notificationToFormData,
  pickNotificationFormChanges,
} from "@/features/notifications/types/notifications.types";
import {
  invalidateQueryCache,
  useCrudMutation,
  type CrudSaveResult,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseNotificationMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useNotificationMutations({
  onSuccess,
}: UseNotificationMutationsOptions = {}) {
  const t = useTranslation();

  const refreshRelatedCaches = useCallback(async () => {
    invalidateQueryCache("me-notifications");
    invalidateQueryCache("me-notifications-center");
    invalidateQueryCache("platform-notifications");
    await onSuccess?.();
  }, [onSuccess]);

  const createMutation = useCrudMutation({
    mutationFn: (data: NotificationFormData) => notificationsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: refreshRelatedCaches,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NotificationFormData> }) =>
      notificationsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: refreshRelatedCaches,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (entity: Notification) => notificationsService.delete(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: refreshRelatedCaches,
  });

  const markReadMutation = useCrudMutation({
    mutationFn: (notification: Notification) =>
      meNotificationsService.markRead(notification.id, true),
    feedback: {
      errorMessage: t.errorMessage,
    },
    onSuccess: async () => {
      invalidateQueryCache("me-notifications");
    },
  });

  const markAllReadMutation = useCrudMutation({
    mutationFn: async (_: void) => {
      await meNotificationsService.markAllRead();
    },
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.notificationsMarkedAllRead,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: refreshRelatedCaches,
  });

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: NotificationFormData,
      entity?: Notification,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = notificationToFormData(entity);
      if (!hasNotificationFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickNotificationFormChanges(original, data),
      });
      return "saved";
    },
    [createMutation, updateMutation],
  );

  const markRead = useCallback(
    async (notification: Notification) => {
      const result = await markReadMutation.mutate(notification);
      if (!result.ok) {
        throw result.error ?? new Error("Failed to mark notification as read");
      }
      return result.data;
    },
    [markReadMutation],
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    markRead,
    markAllRead: () => markAllReadMutation.mutate(undefined),
    isMarkingAllRead: markAllReadMutation.isPending,
    save,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
