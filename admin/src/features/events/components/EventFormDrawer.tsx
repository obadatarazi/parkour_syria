import { EventForm } from "@/features/events/components/EventForm";
import { useEventMutations } from "@/features/events/hooks/use-event-mutations";
import type { ParkourEvent } from "@/features/events/types/events.types";
import { CrudDirtyFormDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type EventFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  event?: ParkourEvent | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function EventFormDrawer({
  open,
  mode,
  event,
  onOpenChange,
  onSuccess,
}: EventFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useEventMutations({ onSuccess });

  return (
    <CrudDirtyFormDrawer
      open={open}
      mode={mode}
      title={mode === "create" ? t.addEvent : t.editEvent}
      size="xl"
      isLoading={isSaving}
      onOpenChange={onOpenChange}
    >
      {({ onDirtyChange, requestClose, closeClean }) => (
        <EventForm
          mode={mode}
          event={event}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={onDirtyChange}
          onSubmit={async (data) => {
            const result = await save(mode, data, event ?? undefined);
            if (result) closeClean();
          }}
        />
      )}
    </CrudDirtyFormDrawer>
  );
}
