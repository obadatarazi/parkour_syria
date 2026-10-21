import { type ReactNode } from "react";

import { PageSection } from "@/shared/components/layout/PageSection";

type CrudListSectionProps = {
  title?: string;
  description?: string;
  toolbar?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function CrudListSection({
  title,
  description,
  toolbar,
  filters,
  children,
  className,
}: CrudListSectionProps) {
  return (
    <PageSection title={title} description={description} className={className}>
      {toolbar}
      {filters}
      {children}
    </PageSection>
  );
}
