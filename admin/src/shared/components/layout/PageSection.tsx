import { type ReactNode } from "react";

import { SectionTitle } from "@/shared/components/typography/Typography";
import { cn } from "@/shared/design-system/components/ui/utils";

type PageSectionProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
};

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
  as: Tag = "section",
}: PageSectionProps) {
  return (
    <Tag className={cn("space-y-4", className)}>
      {title || actions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {title ? (
            <div className="space-y-1">
              <SectionTitle as="h2">{title}</SectionTitle>
              {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
            </div>
          ) : (
            <div />
          )}
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </Tag>
  );
}
