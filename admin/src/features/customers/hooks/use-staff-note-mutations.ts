import { useCallback } from "react";

import { customersService } from "@/features/customers/services/customers.service";
import type { CrmStaffNoteInput } from "@/features/customers/types/customers.types";
import { invalidateQueryCache, useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseStaffNoteMutationsOptions = {
  customerId: number;
  onSuccess?: () => void | Promise<void>;
};

export function useStaffNoteMutations({ customerId, onSuccess }: UseStaffNoteMutationsOptions) {
  const t = useTranslation();

  const refresh = useCallback(async () => {
    invalidateQueryCache("crm-customers");
    await onSuccess?.();
  }, [onSuccess]);

  const createNote = useCrudMutation({
    mutationFn: (input: CrmStaffNoteInput) => customersService.createStaffNote(customerId, input),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crmNoteAdded,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: refresh,
  });

  const updateNote = useCrudMutation({
    mutationFn: ({ noteId, input }: { noteId: number; input: CrmStaffNoteInput }) =>
      customersService.updateStaffNote(customerId, noteId, input),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crmNoteUpdated,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: refresh,
  });

  const deleteNote = useCrudMutation({
    mutationFn: (noteId: number) => customersService.deleteStaffNote(customerId, noteId),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crmNoteDeleted,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: refresh,
  });

  return { createNote, updateNote, deleteNote };
}
