import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type ResponsiveGridProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
};

const gridClassMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
} as const;

export function ResponsiveGrid({ children, columns = 2, className }: ResponsiveGridProps) {
  return <div className={cn("grid gap-4", gridClassMap[columns], className)}>{children}</div>;
}
