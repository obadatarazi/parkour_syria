import { Info, X } from "lucide-react";

import { AppButton } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";

type ContextualHelpTipProps = {
  title: string;
  description: string;
  dismissLabel: string;
  onDismiss: () => void;
  className?: string;
};

export function ContextualHelpTip({
  title,
  description,
  dismissLabel,
  onDismiss,
  className,
}: ContextualHelpTipProps) {
  return (
    <aside
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3",
        className,
      )}
      role="note"
      aria-label={title}
    >
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Info className="size-4" aria-hidden="true" />
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
    </aside>
  );
}
