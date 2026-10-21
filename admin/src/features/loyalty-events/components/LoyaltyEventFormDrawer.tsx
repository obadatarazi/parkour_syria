import { useState } from "react";

import { LoyaltyEventForm } from "@/features/loyalty-events/components/LoyaltyEventForm";
import { useLoyaltyEventMutations } from "@/features/loyalty-events/hooks/use-loyalty-event-mutations";
import { loyaltyEventsService } from "@/features/loyalty-events/services/loyalty-events.service";
import type { LoyaltyEvent } from "@/features/loyalty-events/types/loyalty-events.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type LoyaltyEventFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  event?: LoyaltyEvent | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function LoyaltyEventFormDrawer({
  open,
  mode,
  event,
  onOpenChange,
  onSuccess,
}: LoyaltyEventFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useLoyaltyEventMutations({
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

  const { data: eventDetail, isLoading: isEventLoading } = useCrudQuery({
    queryKey: ["loyalty-events", "detail", String(event?.id ?? "")],
    queryFn: () => loyaltyEventsService.getById(event!.id),
    enabled: open && mode === "edit" && Boolean(event?.id),
  });

  const resolvedEvent = mode === "edit" ? (eventDetail ?? event) : event;

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
        title={mode === "create" ? t.addLoyaltyEvent : t.editLoyaltyEvent}
        size="lg"
        isLoading={isSaving}
        isFetching={mode === "edit" && isEventLoading}
        fetchingLabel={t.loadingMessage}
      >
        <LoyaltyEventForm
          mode={mode}
          event={resolvedEvent}
          isLoading={isSaving || (mode === "edit" && isEventLoading)}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            const result = await save(mode, data, resolvedEvent ?? undefined);
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
