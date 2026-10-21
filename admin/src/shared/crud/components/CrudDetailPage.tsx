import { type ReactNode } from "react";

import { PageContainer, PageHeader } from "@/shared/components";

type CrudDetailPageProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function CrudDetailPage({ title, description, actions, children }: CrudDetailPageProps) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} actions={actions} />
      <div className="space-y-6">{children}</div>
    </PageContainer>
  );
}

type CrudDetailSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function CrudDetailSection({
  title,
  description,
  children,
  actions,
}: CrudDetailSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
