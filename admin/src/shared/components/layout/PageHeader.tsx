import { type ReactNode } from "react";

import { BodyText, PageTitle } from "@/shared/components/typography/Typography";
import { cn } from "@/shared/design-system/components/ui/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
  /** Optional selector hook for in-app guidance tours. */
  titleDataGuidance?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
  titleDataGuidance,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {breadcrumbs ? <div>{breadcrumbs}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1" data-guidance={titleDataGuidance}>
          <PageTitle>{title}</PageTitle>
          {description ? (
            <BodyText className="text-muted-foreground">{description}</BodyText>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
