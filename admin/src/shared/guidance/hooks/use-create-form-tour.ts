import { useEffect, useRef } from "react";

import { useOptionalGuidanceContext } from "@/shared/guidance/context/GuidanceContext";
import { isTourActive } from "@/shared/guidance/tours/run-tour";

const FORM_TOUR_DELAY_MS = 450;

/**
 * When a create form opens (drawer or workspace page), run the page formTour once (until seen).
 * Skips if another tour is already active (e.g. Help → Walkthrough).
 * Interaction with the drawer is kept enabled in `startTour` (`disableActiveInteraction: false`)
 * so the tour cannot block typing in the form it is introducing.
 */
export function useCreateFormTour(open: boolean, formMode?: "create" | "edit") {
  const guidance = useOptionalGuidanceContext();
  const firedForOpen = useRef(false);
  const startFormTour = guidance?.startFormTour;
  const seenFormTour = guidance?.persisted.seenFormTour ?? false;
  const hasFormTour = Boolean(guidance?.config?.formTour?.length);
  const autoFormTourOnce = guidance?.config?.autoFormTourOnce !== false;

  useEffect(() => {
    if (!open) {
      firedForOpen.current = false;
      return;
    }
    if (formMode !== "create") return;
    if (!hasFormTour || !autoFormTourOnce || seenFormTour) return;
    if (!startFormTour) return;
    if (firedForOpen.current) return;
    if (isTourActive()) return;

    firedForOpen.current = true;
    const timer = window.setTimeout(() => {
      if (isTourActive()) return;
      startFormTour();
    }, FORM_TOUR_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [open, formMode, hasFormTour, autoFormTourOnce, seenFormTour, startFormTour]);
}
