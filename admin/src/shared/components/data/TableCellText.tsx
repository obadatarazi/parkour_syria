import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type TableCellTextProps = {
  children: ReactNode;
  /** Full value for native tooltip when truncated. */
  title?: string;
  className?: string;
  as?: "span" | "p" | "div";
};

/**
 * Shared truncated text for dense DataTable cells (fits ~13" screens).
 */
export function TableCellText({
  children,
  title,
  className,
  as: Comp = "span",
}: TableCellTextProps) {
  return (
    <Comp
      className={cn("block min-w-0 max-w-full truncate text-xs", className)}
      title={title}
    >
      {children}
    </Comp>
  );
}
