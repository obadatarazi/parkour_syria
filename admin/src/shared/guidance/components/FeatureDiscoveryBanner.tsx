import { Sparkles, X } from "lucide-react";

import { AppButton } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";

type FeatureDiscoveryBannerProps = {
  title: string;
  description: string;
  dismissLabel: string;
  onDismiss: () => void;
  className?: string;
};

export function FeatureDiscoveryBanner({
  title,
  description,
  dismissLabel,
  onDismiss,
  className,
}: FeatureDiscoveryBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3",
        className,
      )}
      role="status"
    >
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
        <Sparkles className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-semibold text-foreground" dir="auto">
          {title}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground" dir="auto">
          {description}
        </p>
      </div>
      <AppButton
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        aria-label={dismissLabel}
        onClick={onDismiss}
      >
        <X className="size-4" aria-hidden="true" />
      </AppButton>
    </div>
  );
}
