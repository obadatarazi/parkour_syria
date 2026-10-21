import { useState } from "react";

import { NotificationRouteForm } from "@/features/notification-routes/components/NotificationRouteForm";
import { useNotificationRouteMutations } from "@/features/notification-routes/hooks/use-notification-route-mutations";
import type { NotificationRoute } from "@/features/notification-routes/types/notification-routes.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type NotificationRouteFormDrawerProps = {
  open: boolean;
  entity?: NotificationRoute | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function NotificationRouteFormDrawer({
  open,
  entity,
  onOpenChange,
  onSuccess,
}: NotificationRouteFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useNotificationRouteMutations({
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

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
        formMode="edit"
        onOpenChange={(next) => (next ? onOpenChange(next) : requestClose())}
        title={entity ? `${t.editAction}: ${entity.event.label}` : t.editNotificationRoute}
        description={t.notificationRouteFallbackHint}
        size="xl"
        isLoading={isSaving}
      >
        <NotificationRouteForm
          mode="edit"
          entity={entity}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            const result = await save(entity?.event.value ?? "", data, entity ?? undefined);
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

