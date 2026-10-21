import { Inbox } from "lucide-react";
import { type ReactNode } from "react";

import { BodyText, SectionTitle } from "@/shared/components/typography/Typography";
import { cn } from "@/shared/design-system/components/ui/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-12 text-center",
        className,
      )}
      role="status"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="size-6" aria-hidden="true" />}
      </div>
      <div className="max-w-sm space-y-2">
        <SectionTitle as="h3">{title}</SectionTitle>
        {description ? <BodyText className="text-muted-foreground">{description}</BodyText> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
