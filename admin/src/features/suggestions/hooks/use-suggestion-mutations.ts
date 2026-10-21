import { suggestionsService } from "@/features/suggestions/services/suggestions.service";
import {
  pickSuggestionFormChanges,
  type Suggestion,
  type SuggestionAcceptData,
  suggestionToFormData,
} from "@/features/suggestions/types/suggestions.types";
import { useCrudMutation, useEntityCrudMutations } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export function useSuggestionMutations({
  onSuccess,
}: { onSuccess?: () => void | Promise<void> } = {}) {
  const t = useTranslation();

  const crud = useEntityCrudMutations({
    service: suggestionsService,
    toFormData: suggestionToFormData,
    pickChanges: pickSuggestionFormChanges,
    onSuccess,
  });

  const acceptMutation = useCrudMutation({
    mutationFn: ({ suggestion, data }: { suggestion: Suggestion; data: SuggestionAcceptData }) =>
      suggestionsService.accept(suggestion.id, data),
    feedback: {
      successMessage: t.suggestionAccepted,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const rejectMutation = useCrudMutation({
    mutationFn: ({ suggestion, reason }: { suggestion: Suggestion; reason: string }) =>
      suggestionsService.reject(suggestion.id, reason),
    feedback: {
      successMessage: t.suggestionRejected,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  return {
    ...crud,
    acceptMutation,
    rejectMutation,
    isReviewing: acceptMutation.isPending || rejectMutation.isPending,
  };
}
