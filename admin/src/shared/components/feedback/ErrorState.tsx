import { AlertCircle } from "lucide-react";
import { type ReactNode } from "react";

import { BodyText, SectionTitle } from "@/shared/components/typography/Typography";
import { cn } from "@/shared/design-system/components/ui/utils";

type ErrorStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({ title, description, action, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" aria-hidden="true" />
      </div>
      <div className="max-w-md space-y-2">
        <SectionTitle as="h3">{title}</SectionTitle>
        {description ? <BodyText className="text-muted-foreground">{description}</BodyText> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
