import { eventsService } from "@/features/events/services/events.service";
import {
  eventToFormData,
  pickEventFormChanges,
} from "@/features/events/types/events.types";
import { useEntityCrudMutations } from "@/shared/crud";

export function useEventMutations({
  onSuccess,
}: { onSuccess?: () => void | Promise<void> } = {}) {
  return useEntityCrudMutations({
    service: eventsService,
    toFormData: eventToFormData,
    pickChanges: pickEventFormChanges,
    onSuccess,
  });
}
