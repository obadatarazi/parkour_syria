import { CheckCircle2, ChevronDown, ChevronUp, Circle, GripVertical, ListTodo, X } from "lucide-react";
import { useState } from "react";

import { AppButton } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { GuidanceFloatingPanel } from "@/shared/guidance/components/GuidanceFloatingPanel";

export type GuidanceChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

type GuidanceChecklistProps = {
  title: string;
  description: string;
  progressLabel: string;
  dismissLabel: string;
  collapseLabel: string;
  expandLabel: string;
  dragLabel: string;
  items: GuidanceChecklistItem[];
  onToggle: (id: string) => void;
  onDismiss: () => void;
  className?: string;
  defaultCollapsed?: boolean;
  stackOrder?: number;
  panelId?: string;
};

export function GuidanceChecklist({
  title,
  description,
  progressLabel,
  dismissLabel,
  collapseLabel,
  expandLabel,
  dragLabel,
  items,
  onToggle,
  onDismiss,
  className,
  defaultCollapsed = false,
  stackOrder = 1,
  panelId = "guidance-checklist",
}: GuidanceChecklistProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const doneCount = items.filter((item) => item.done).length;
  const progressText = progressLabel
    .replace("{done}", String(doneCount))
    .replace("{total}", String(items.length));

  return (
    <GuidanceFloatingPanel
      panelId={panelId}
      stackOrder={stackOrder}
      estimatedHeight={collapsed ? 72 : 260}
      dragLabel={dragLabel}
      className={cn("p-4", className)}
      header={
        <div className={cn("flex items-start gap-2", !collapsed && "mb-3")}>
          <div className="mt-1 text-muted-foreground" aria-hidden="true">
            <GripVertical className="size-4" />
          </div>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <ListTodo className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-foreground">{title}</h2>
            {collapsed ? (
              <p className="mt-0.5 text-[11px] font-medium text-brand">{progressText}</p>
            ) : (
              <>
                <p className="text-[11px] text-muted-foreground">{description}</p>
                <p className="mt-1 text-[11px] font-medium text-brand">{progressText}</p>
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-0.5" data-no-drag>
            <AppButton
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={collapsed ? expandLabel : collapseLabel}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? (
                <ChevronUp className="size-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-4" aria-hidden="true" />
              )}
            </AppButton>
            <AppButton
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={dismissLabel}
              onClick={onDismiss}
            >
              <X className="size-4" aria-hidden="true" />
            </AppButton>
          </div>
        </div>
      }
    >
      {!collapsed ? (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-xs transition-colors hover:bg-muted",
                  item.done ? "text-muted-foreground line-through" : "text-foreground",
                )}
                onClick={() => onToggle(item.id)}
                aria-pressed={item.done}
              >
                {item.done ? (
                  <CheckCircle2 className="size-4 shrink-0 text-brand" aria-hidden="true" />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </GuidanceFloatingPanel>
  );
}
