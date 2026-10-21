import { type ReactNode } from "react";

import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { cn } from "@/shared/design-system/components/ui/utils";

type CrudLoadingOverlayProps = {
  isLoading: boolean;
  label?: string;
  children: ReactNode;
  className?: string;
};

export function CrudLoadingOverlay({
  isLoading,
  label,
  children,
  className,
}: CrudLoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-[1px]"
          aria-live="polite"
          aria-busy="true"
        >
          <LoadingState label={label} variant="inline" />
        </div>
      ) : null}
    </div>
  );
}
