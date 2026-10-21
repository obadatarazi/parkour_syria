import { AppButton, ErrorState } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type AppErrorFallbackUIProps = {
  onRetry: () => void;
};

export function AppErrorFallbackUI({ onRetry }: AppErrorFallbackUIProps) {
  const t = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <ErrorState
        title={t.errorStateDefaultTitle}
        description={t.appErrorBoundaryDescription}
        action={
          <AppButton variant="outline" onClick={onRetry}>
            {t.reloadPage}
          </AppButton>
        }
        className="max-w-md"
      />
    </div>
  );
}
