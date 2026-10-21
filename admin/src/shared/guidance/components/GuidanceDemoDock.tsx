import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Filter,
  Footprints,
  GripVertical,
  HelpCircle,
  ListTodo,
  Map,
  PackageOpen,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { AppButton } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { GuidanceFloatingPanel } from "@/shared/guidance/components/GuidanceFloatingPanel";

export type GuidanceDemoDockState = {
  active: boolean;
  showHotspots: boolean;
  showChecklist: boolean;
  showBanner: boolean;
  showContextualTip: boolean;
  forceEmpty: boolean;
};

type GuidanceDemoDockProps = {
  state: GuidanceDemoDockState;
  labels: {
    title: string;
    productTour: string;
    coachMarks: string;
    walkthrough: string;
    hotspots: string;
    checklist: string;
    banner: string;
    contextualTip: string;
    emptyState: string;
    stop: string;
    collapse: string;
    expand: string;
    drag: string;
  };
  onProductTour: () => void;
  onCoachMarks: () => void;
  onWalkthrough: () => void;
  onToggle: (key: keyof Omit<GuidanceDemoDockState, "active">) => void;
  onStop: () => void;
  className?: string;
  defaultCollapsed?: boolean;
  stackOrder?: number;
};

type DockToggle = {
  key: keyof Omit<GuidanceDemoDockState, "active">;
  label: string;
  icon: typeof Eye;
};

export function GuidanceDemoDock({
  state,
  labels,
  onProductTour,
  onCoachMarks,
  onWalkthrough,
  onToggle,
  onStop,
  className,
  defaultCollapsed = false,
  stackOrder = 0,
}: GuidanceDemoDockProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (!state.active) return null;

  const toggles: DockToggle[] = [
    { key: "showHotspots", label: labels.hotspots, icon: HelpCircle },
    { key: "showChecklist", label: labels.checklist, icon: ListTodo },
    { key: "showBanner", label: labels.banner, icon: Sparkles },
    { key: "showContextualTip", label: labels.contextualTip, icon: Filter },
    { key: "forceEmpty", label: labels.emptyState, icon: PackageOpen },
  ];

  return (
    <GuidanceFloatingPanel
      panelId="guidance-demo-dock"
      stackOrder={stackOrder}
      estimatedHeight={collapsed ? 56 : 320}
      dragLabel={labels.drag}
      className={cn("p-3", className)}
      header={
        <div className={cn("flex items-center justify-between gap-2", !collapsed && "mb-2")}>
          <div className="flex min-w-0 items-center gap-1.5">
            <GripVertical className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-xs font-bold text-foreground">{labels.title}</p>
          </div>
          <div className="flex items-center gap-0.5" data-no-drag>
            <AppButton
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={collapsed ? labels.expand : labels.collapse}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? (
                <ChevronUp className="size-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-3.5" aria-hidden="true" />
              )}
            </AppButton>
            <AppButton variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={onStop}>
              <EyeOff className="size-3.5" aria-hidden="true" />
              {labels.stop}
            </AppButton>
          </div>
        </div>
      }
    >
      {!collapsed ? (
        <>
          <div className="mb-2 grid grid-cols-1 gap-1.5">
            <AppButton
              variant="outline"
              size="sm"
              className="h-8 justify-start text-xs"
              onClick={onProductTour}
            >
              <Map className="size-3.5" aria-hidden="true" />
              {labels.productTour}
            </AppButton>
            <AppButton
              variant="outline"
              size="sm"
              className="h-8 justify-start text-xs"
              onClick={onCoachMarks}
            >
              <HelpCircle className="size-3.5" aria-hidden="true" />
              {labels.coachMarks}
            </AppButton>
            <AppButton
              variant="outline"
              size="sm"
              className="h-8 justify-start text-xs"
              onClick={onWalkthrough}
            >
              <Footprints className="size-3.5" aria-hidden="true" />
              {labels.walkthrough}
            </AppButton>
          </div>

          <ul className="space-y-1 border-t border-border/60 pt-2">
            {toggles.map((toggle) => {
              const Icon = toggle.icon;
              const enabled = state[toggle.key];
              return (
                <li key={toggle.key}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-[11px] transition-colors hover:bg-muted",
                      enabled ? "text-foreground" : "text-muted-foreground",
                    )}
                    aria-pressed={enabled}
                    onClick={() => onToggle(toggle.key)}
                  >
                    {enabled ? (
                      <Eye className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
                    ) : (
                      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span>{toggle.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </GuidanceFloatingPanel>
  );
}
