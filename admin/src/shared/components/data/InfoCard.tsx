import { Info } from "lucide-react";
import { type ReactNode } from "react";

import { BodyText, CardTitleText } from "@/shared/components/typography/Typography";
import { cn } from "@/shared/design-system/components/ui/utils";

type InfoCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function InfoCard({ title, description, action, className }: InfoCardProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-info/20 bg-info-muted/40 p-4 text-start",
        className,
      )}
      role="note"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
        <Info className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1 space-y-1 text-start">
        <CardTitleText as="p" className="text-sm">
          {title}
        </CardTitleText>
        {description ? <BodyText className="text-muted-foreground">{description}</BodyText> : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  );
}
