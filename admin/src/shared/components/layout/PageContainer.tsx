import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  maxWidth?: "default" | "full";
};

export function PageContainer({ children, className, maxWidth = "default" }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full space-y-5 p-5 sm:p-6",
        maxWidth === "default" && "max-w-screen-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
