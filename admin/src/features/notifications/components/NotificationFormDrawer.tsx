import { useState } from "react";

import { NotificationForm } from "@/features/notifications/components/NotificationForm";
import { useNotificationMutations } from "@/features/notifications/hooks/use-notification-mutations";
import { notificationsService } from "@/features/notifications/services/notifications.service";
import type { Notification } from "@/features/notifications/types/notifications.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type NotificationFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  entity?: Notification | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function NotificationFormDrawer({
  open,
  mode,
  entity,
  onOpenChange,
  onSuccess,
}: NotificationFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useNotificationMutations({
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

  const { data: detail, isLoading: isDetailLoading } = useCrudQuery({
    queryKey: ["notifications", "detail", String(entity?.id ?? "")],
    queryFn: () => notificationsService.getById(entity!.id),
    enabled: open && mode === "edit" && Boolean(entity?.id),
  });

  const resolvedEntity = mode === "edit" ? (detail ?? entity) : entity;

  const requestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    onOpenChange(false);
  };

  return (
    <>
      <CrudEntityDrawer
        open={open}
        formMode={mode}
        onOpenChange={(next) => (next ? onOpenChange(next) : requestClose())}
        title={mode === "create" ? t.addNotification : t.editNotification}
        size="lg"
        isLoading={isSaving}
        isFetching={mode === "edit" && isDetailLoading}
        fetchingLabel={t.loadingMessage}
      >
        <NotificationForm
          mode={mode}
          entity={resolvedEntity}
          isLoading={isSaving || (mode === "edit" && isDetailLoading)}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            const result = await save(mode, data, resolvedEntity ?? undefined);
            if (result === "skipped") {
              setIsDirty(false);
              onOpenChange(false);
            }
          }}
        />
      </CrudEntityDrawer>

      <ConfirmDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title={t.discardChangesTitle}
        description={t.discardChangesDescription}
        confirmLabel={t.discardChangesConfirm}
        cancelLabel={t.cancel}
        variant="destructive"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          setIsDirty(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
