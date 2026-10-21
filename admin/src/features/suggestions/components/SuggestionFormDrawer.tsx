import { SuggestionForm } from "@/features/suggestions/components/SuggestionForm";
import { useSuggestionMutations } from "@/features/suggestions/hooks/use-suggestion-mutations";
import type { Suggestion } from "@/features/suggestions/types/suggestions.types";
import { CrudDirtyFormDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type SuggestionFormDrawerProps = {
  open: boolean;
  suggestion: Suggestion | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function SuggestionFormDrawer({
  open,
  suggestion,
  onOpenChange,
  onSuccess,
}: SuggestionFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useSuggestionMutations({ onSuccess });

  return (
    <CrudDirtyFormDrawer
      open={open && Boolean(suggestion)}
      mode="edit"
      title={t.editSuggestion}
      size="lg"
      isLoading={isSaving}
      onOpenChange={onOpenChange}
    >
      {({ onDirtyChange, requestClose, closeClean }) =>
        suggestion ? (
          <SuggestionForm
            suggestion={suggestion}
            isLoading={isSaving}
            onCancel={requestClose}
            onDirtyChange={onDirtyChange}
            onSubmit={async (data) => {
              const result = await save("edit", data, suggestion);
              if (result) closeClean();
            }}
          />
        ) : null
      }
    </CrudDirtyFormDrawer>
  );
}
