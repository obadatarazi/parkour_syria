import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type ResponsiveStackProps = {
  children: ReactNode;
  direction?: "vertical" | "horizontal";
  gap?: "sm" | "md" | "lg";
  className?: string;
  wrap?: boolean;
};

const gapClassMap = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
} as const;

export function ResponsiveStack({
  children,
  direction = "vertical",
  gap = "md",
  className,
  wrap = false,
}: ResponsiveStackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "vertical" && "flex-col",
        direction === "horizontal" && "flex-col sm:flex-row sm:items-center",
        wrap && "flex-wrap",
        gapClassMap[gap],
        className,
      )}
    >
      {children}
    </div>
  );
}
