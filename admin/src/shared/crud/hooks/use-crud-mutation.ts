import { useCallback, useState } from "react";

import type {
  CrudMutationFeedback,
  CrudMutationResult,
  CrudMutationState,
} from "@/shared/crud/types/crud.types";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { getServiceErrorCode, resolveServiceErrorMessage } from "@/shared/errors";
import { notify } from "@/shared/lib/notifications";

type UseCrudMutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  feedback?: CrudMutationFeedback;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables) => void;
};

export function useCrudMutation<TData = unknown, TVariables = void>({
  mutationFn,
  feedback,
  onSuccess,
  onError,
}: UseCrudMutationOptions<TData, TVariables>): CrudMutationState<TData, TVariables> {
  const t = useTranslation();
  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<CrudMutationState<TData, TVariables>["status"]>("idle");

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setStatus("idle");
  }, []);

  const mutate = useCallback(
    async (variables: TVariables): Promise<CrudMutationResult<TData>> => {
      setStatus("pending");
      setError(null);

      const toastId = feedback?.loadingMessage ? notify.loading(feedback.loadingMessage) : undefined;

      try {
        const result = await mutationFn(variables);
        setData(result);
        setStatus("success");

        if (feedback?.successMessage) {
          notify.success(feedback.successMessage, feedback.successDescription, { id: toastId });
        } else if (toastId !== undefined) {
          notify.dismiss(toastId);
        }

        await onSuccess?.(result, variables);
        return { ok: true, data: result };
      } catch (caughtError) {
        const nextError = caughtError instanceof Error ? caughtError : new Error("Mutation failed");
        setError(nextError);
        setStatus("error");

        if (feedback?.errorMessage) {
          // Session-expiry toast is owned by AuthProvider — avoid duplicate noise.
          if (getServiceErrorCode(nextError) !== "session_expired") {
            notify.error(
              feedback.errorMessage,
              feedback.errorDescription ?? resolveServiceErrorMessage(nextError, t),
              { id: toastId },
            );
          } else if (toastId !== undefined) {
            notify.dismiss(toastId);
          }
        } else if (toastId !== undefined) {
          notify.dismiss(toastId);
        }

        onError?.(nextError, variables);
        return { ok: false, error: nextError };
      }
    },
    [feedback, mutationFn, onError, onSuccess, t],
  );

  return {
    mutate,
    reset,
    data,
    error,
    status,
    isPending: status === "pending",
    isError: status === "error",
    isSuccess: status === "success",
  };
}
