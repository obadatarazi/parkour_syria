import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type ActionGroupProps = {
  children: ReactNode;
  className?: string;
  align?: "start" | "end" | "between";
};

export function ActionGroup({ children, className, align = "end" }: ActionGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        align === "start" && "justify-start",
        align === "end" && "justify-end",
        align === "between" && "justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}
