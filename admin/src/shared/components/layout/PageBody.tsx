import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type PageBodyProps = {
  children: ReactNode;
  className?: string;
};

export function PageBody({ children, className }: PageBodyProps) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}
