import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type GuidanceHotspotProps = {
  active: boolean;
  label: string;
  onDismiss: () => void;
  children: ReactNode;
  className?: string;
  /** Preferred side for the pulsing dot */
  side?: "top-end" | "top-start";
};

export function GuidanceHotspot({
  active,
  label,
  onDismiss,
  children,
  className,
  side = "top-end",
}: GuidanceHotspotProps) {
  return (
    <div className={cn("relative inline-flex", className)}>
      {children}
      {active ? (
        <button
          type="button"
          className={cn(
            "absolute z-20 flex size-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            side === "top-end" ? "-end-1 -top-1" : "-start-1 -top-1",
          )}
          aria-label={label}
          onClick={(event) => {
            event.stopPropagation();
            onDismiss();
          }}
        >
          <span className="aroma-guidance-hotspot-dot absolute inset-0 rounded-full bg-brand/40" aria-hidden="true" />
          <span className="relative size-2.5 rounded-full bg-brand shadow-sm" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
