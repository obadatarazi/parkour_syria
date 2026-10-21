import { type ReactNode } from "react";

import { BodyText } from "@/shared/components/typography/Typography";
import { cn } from "@/shared/design-system/components/ui/utils";

type ActionBarProps = {
  label?: string;
  children: ReactNode;
  className?: string;
};

export function ActionBar({ label, children, className }: ActionBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      role="toolbar"
      aria-label={label}
    >
      {label ? <BodyText className="font-medium text-foreground">{label}</BodyText> : <span />}
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
