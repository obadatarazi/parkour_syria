import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type FormActionsProps = {
  children: ReactNode;
  className?: string;
  align?: "start" | "end" | "between";
  "data-guidance"?: string;
};

export function FormActions({
  children,
  className,
  align = "end",
  "data-guidance": dataGuidance,
}: FormActionsProps) {
  return (
    <div
      data-guidance={dataGuidance}
      className={cn(
        "flex flex-col-reverse gap-3 pt-2 sm:flex-row",
        align === "start" && "sm:justify-start",
        align === "end" && "sm:justify-end",
        align === "between" && "sm:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}
