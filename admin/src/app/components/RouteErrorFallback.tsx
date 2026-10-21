import { useRouteError } from "react-router";

import { AppButton, ErrorState } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { isChunkLoadError } from "@/shared/errors/is-chunk-load-error";

export function RouteErrorFallback() {
  const error = useRouteError();
  const t = useTranslation();
  const chunkLoadFailed = isChunkLoadError(error);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <ErrorState
        title={chunkLoadFailed ? t.chunkLoadErrorTitle : t.errorStateDefaultTitle}
        description={
          chunkLoadFailed ? t.chunkLoadErrorDescription : t.appErrorBoundaryDescription
        }
        action={
          <AppButton variant="outline" onClick={() => window.location.reload()}>
            {t.tryAgain}
          </AppButton>
        }
        className="max-w-lg"
      />
    </div>
  );
}
