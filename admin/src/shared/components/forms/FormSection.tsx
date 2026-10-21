import { type ReactNode } from "react";

import { SectionTitle } from "@/shared/components/typography/Typography";
import { cn } from "@/shared/design-system/components/ui/utils";

type FormSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  dataGuidance?: string;
};

export function FormSection({
  title,
  description,
  children,
  className,
  dataGuidance,
}: FormSectionProps) {
  return (
    <section className={cn("space-y-4", className)} data-guidance={dataGuidance}>
      {title ? (
        <div className="space-y-1">
          <SectionTitle as="h3">{title}</SectionTitle>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
