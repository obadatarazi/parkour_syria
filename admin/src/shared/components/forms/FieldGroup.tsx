import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type FieldGroupProps = {
  children: ReactNode;
  className?: string;
};

export function FieldGroup({ children, className }: FieldGroupProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
