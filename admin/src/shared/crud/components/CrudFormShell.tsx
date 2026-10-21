import { type FormHTMLAttributes, forwardRef, type ReactNode } from "react";

import { ErrorState } from "@/shared/components";
import { AppButton } from "@/shared/components/buttons/AppButton";
import { cn } from "@/shared/design-system/components/ui/utils";

type CrudFormShellProps = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showError?: boolean;
};

export const CrudFormShell = forwardRef<HTMLFormElement, CrudFormShellProps>(function CrudFormShell(
  {
    children,
    className,
    errorTitle,
    errorDescription,
    onRetry,
    retryLabel,
    showError = false,
    ...props
  },
  ref,
) {
  return (
    <form ref={ref} className={cn("space-y-5", className)} noValidate {...props}>
      {showError && errorTitle ? (
        <ErrorState
          title={errorTitle}
          description={errorDescription}
          action={
            onRetry && retryLabel ? (
              <AppButton type="button" variant="ghost" size="sm" onClick={onRetry}>
                {retryLabel}
              </AppButton>
            ) : undefined
          }
          className="py-6"
        />
      ) : null}
      {children}
    </form>
  );
});
