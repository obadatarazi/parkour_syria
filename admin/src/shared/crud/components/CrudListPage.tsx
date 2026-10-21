import { type ReactNode } from "react";

import { PageContainer, PageHeader } from "@/shared/components";
import { GuidancePageNotices } from "@/shared/guidance/components/GuidancePageNotices";

type CrudListPageProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  titleDataGuidance?: string;
  /** Wraps the actions cluster for in-app guidance tours (e.g. Add button). */
  actionsDataGuidance?: string;
  /** When true, skip page chrome (used inside Homepage CMS tabs). */
  embedded?: boolean;
};

export function CrudListPage({
  title,
  description,
  actions,
  children,
  titleDataGuidance,
  actionsDataGuidance,
  embedded = false,
}: CrudListPageProps) {
  const actionsNode =
    actions && actionsDataGuidance ? (
      <div data-guidance={actionsDataGuidance} className="inline-flex flex-wrap items-center gap-2">
        {actions}
      </div>
    ) : (
      actions
    );

  if (embedded) {
    return (
      <div className="space-y-5">
        {actionsNode ? <div className="flex flex-wrap justify-end gap-2">{actionsNode}</div> : null}
        <GuidancePageNotices />
        {children}
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        actions={actionsNode}
        titleDataGuidance={titleDataGuidance}
      />
      <GuidancePageNotices />
      {children}
    </PageContainer>
  );
}
