import { type ReactNode } from "react";

import { AppCard } from "@/shared/components/layout/AppCard";
import { cn } from "@/shared/design-system/components/ui/utils";

type ContentCardProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function ContentCard({ children, title, description, actions, className }: ContentCardProps) {
  return (
    <AppCard
      title={title}
      description={description}
      className={cn(className)}
      footer={actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : undefined}
    >
      {children}
    </AppCard>
  );
}
