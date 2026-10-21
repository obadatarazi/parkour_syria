import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type FormRowProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
};

const columnClassMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
} as const;

export function FormRow({ children, columns = 2, className }: FormRowProps) {
  return <div className={cn("grid gap-4", columnClassMap[columns], className)}>{children}</div>;
}
