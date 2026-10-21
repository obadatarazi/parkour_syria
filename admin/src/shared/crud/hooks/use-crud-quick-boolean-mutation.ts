import { useCallback } from "react";

import { useCrudMutation } from "@/shared/crud/hooks/use-crud-mutation";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseCrudQuickBooleanMutationOptions<TId extends string | number> = {
  updateFn: (id: TId, data: Record<string, boolean>) => Promise<unknown>;
};

type QuickBooleanVariables<TId extends string | number> = {
  id: TId;
  field: string;
  value: boolean;
};

export function useCrudQuickBooleanMutation<TId extends string | number>({
  updateFn,
}: UseCrudQuickBooleanMutationOptions<TId>) {
  const t = useTranslation();

  const mutation = useCrudMutation<unknown, QuickBooleanVariables<TId>>({
    mutationFn: ({ id, field, value }) => updateFn(id, { [field]: value }),
    feedback: {
      errorMessage: t.errorMessage,
    },
  });

  const quickToggle = useCallback(
    (id: TId, field: string, value: boolean) => mutation.mutate({ id, field, value }),
    [mutation],
  );

  return {
    quickToggle,
    isQuickToggling: mutation.isPending,
  };
}
