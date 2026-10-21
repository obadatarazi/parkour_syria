import { type ReactNode, Suspense } from "react";

import { LoadingState } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type RouteSuspenseProps = {
  children: ReactNode;
  fullScreen?: boolean;
};

export function RouteSuspense({ children, fullScreen = false }: RouteSuspenseProps) {
  const t = useTranslation();

  return (
    <Suspense
      fallback={
        <LoadingState
          label={t.loadingMessage}
          className={fullScreen ? "min-h-screen" : "min-h-[50vh]"}
        />
      }
    >
      {children}
    </Suspense>
  );
}
