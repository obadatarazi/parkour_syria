import { Info, X } from "lucide-react";
import { useCallback, useState } from "react";

import { Alert, AlertDescription, AlertTitle, AppButton } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const DISMISS_STORAGE_KEY = "admin-demo-data-banner-dismissed";

type DemoDataBannerProps = {
  className?: string;
  /**
   * `page` — full-width notice for entirely mock screens.
   * `section` — compact strip for a mock block inside an otherwise live page.
   */
  variant?: "page" | "section";
  /** When true (page variant only), dismiss is remembered for the browser session. */
  dismissible?: boolean;
};

export function DemoDataBanner({
  className,
  variant = "page",
  dismissible,
}: DemoDataBannerProps) {
  const t = useTranslation();
  const canDismiss = dismissible ?? variant === "page";

  const [dismissed, setDismissed] = useState(() => {
    if (!canDismiss || typeof window === "undefined") return false;
    return sessionStorage.getItem(DISMISS_STORAGE_KEY) === "1";
  });

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(DISMISS_STORAGE_KEY, "1");
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  if (variant === "section") {
    return (
      <div
        role="status"
        className={cn(
          "flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-muted px-3 py-2 text-xs text-warning",
          className,
        )}
      >
        <Info className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden="true" />
        <p className="min-w-0 leading-snug text-foreground">
          <span className="font-semibold">{t.demoDataSectionLabel}</span>
          <span className="text-muted-foreground">
            {" — "}
            {t.demoDataSectionHint}
          </span>
        </p>
      </div>
    );
  }

  return (
    <Alert
      className={cn(
        "border-warning/35 bg-warning-muted text-foreground [&>svg]:text-warning",
        "*:data-[slot=alert-description]:text-muted-foreground",
        canDismiss && "pe-12",
        className,
      )}
    >
      <Info aria-hidden="true" />
      <AlertTitle>{t.demoDataBannerTitle}</AlertTitle>
      <AlertDescription>{t.demoDataBannerDescription}</AlertDescription>
      {canDismiss ? (
        <AppButton
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="absolute end-3 top-3 size-8 text-muted-foreground hover:text-foreground"
          aria-label={t.demoDataBannerDismiss}
        >
          <X className="size-4" aria-hidden="true" />
        </AppButton>
      ) : null}
    </Alert>
  );
}
