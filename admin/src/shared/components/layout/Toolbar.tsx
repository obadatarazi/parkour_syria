import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type ToolbarProps = {
  start?: ReactNode;
  end?: ReactNode;
  className?: string;
};

export function Toolbar({ start, end, className }: ToolbarProps) {
  if (!start && !end) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {start ? <div className="flex flex-1 flex-wrap items-center gap-2">{start}</div> : <div />}
      {end ? <div className="flex flex-wrap items-center gap-2">{end}</div> : null}
    </div>
  );
}
