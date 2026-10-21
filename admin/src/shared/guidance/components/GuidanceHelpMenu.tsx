import "@/shared/guidance/styles/guidance.css";

import { CircleHelp, ListTodo, Map, MousePointerClick, Route, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

import { Button } from "@/shared/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/design-system/components/ui/dropdown-menu";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useOptionalGuidanceContext } from "@/shared/guidance/context/GuidanceContext";

const SHINE_MS = 4200;

export function GuidanceHelpMenu() {
  const t = useTranslation();
  const location = useLocation();
  const guidance = useOptionalGuidanceContext();
  const config = guidance?.config ?? null;
  const hasGuidance = Boolean(config);
  const hasTour = Boolean(config?.productTour.length);
  const hasCoach = Boolean(config?.coachMarks?.length);
  const hasWalkthrough = Boolean(config?.walkthrough?.length);
  const hasChecklist = Boolean(config?.checklist);
  const hasWhatsNew = Boolean(config?.featureDiscovery);
  const [shine, setShine] = useState(false);

  useEffect(() => {
    if (!hasGuidance) {
      setShine(false);
      return;
    }
    setShine(true);
    const timer = window.setTimeout(() => setShine(false), SHINE_MS);
    return () => window.clearTimeout(timer);
  }, [hasGuidance, location.pathname]);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) setShine(false);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("rounded-xl", shine && "aroma-guidance-help-shine")}
          aria-label={t.guidanceHelpMenu ?? "Help"}
        >
          <CircleHelp className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t.guidanceHelpMenu ?? "In-app guidance"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!hasTour}
          onClick={() => guidance?.startProductTour()}
        >
          <Map className="size-4" aria-hidden="true" />
          {t.guidanceProductTour ?? "Page tour"}
        </DropdownMenuItem>
        {hasCoach ? (
          <DropdownMenuItem onClick={() => guidance?.startCoachMarks()}>
            <MousePointerClick className="size-4" aria-hidden="true" />
            {t.guidanceCoachMarks ?? "Coach marks"}
          </DropdownMenuItem>
        ) : null}
        {hasWalkthrough ? (
          <DropdownMenuItem onClick={() => guidance?.startWalkthrough()}>
            <Route className="size-4" aria-hidden="true" />
            {t.guidanceWalkthrough ?? "Walkthrough"}
          </DropdownMenuItem>
        ) : null}
        {hasChecklist ? (
          <DropdownMenuItem onClick={() => guidance?.showChecklist()}>
            <ListTodo className="size-4" aria-hidden="true" />
            {t.guidanceToggleChecklist ?? "Checklist"}
          </DropdownMenuItem>
        ) : null}
        {hasWhatsNew ? (
          <DropdownMenuItem onClick={() => guidance?.showWhatsNew()}>
            <Sparkles className="size-4" aria-hidden="true" />
            {t.guidanceToggleBanner ?? "What's new"}
          </DropdownMenuItem>
        ) : null}
        {!config ? (
          <DropdownMenuItem disabled>
            {t.guidanceNoPageHelp ?? "No guidance on this page"}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
