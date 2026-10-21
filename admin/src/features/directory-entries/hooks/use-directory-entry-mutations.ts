import { directoryEntriesService } from "@/features/directory-entries/services/directory-entries.service";
import {
  directoryEntryToFormData,
  pickDirectoryEntryFormChanges,
} from "@/features/directory-entries/types/directory-entries.types";
import { useEntityCrudMutations } from "@/shared/crud";

export function useDirectoryEntryMutations({
  onSuccess,
}: { onSuccess?: () => void | Promise<void> } = {}) {
  return useEntityCrudMutations({
    service: directoryEntriesService,
    toFormData: directoryEntryToFormData,
    pickChanges: pickDirectoryEntryFormChanges,
    onSuccess,
  });
}
