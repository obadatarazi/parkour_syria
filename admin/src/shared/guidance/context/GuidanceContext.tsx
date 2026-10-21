import { createContext, useContext } from "react";

import type {
  GuidancePageId,
  GuidancePersistedState,
  PageGuidanceConfig,
} from "@/shared/guidance/types/guidance.types";

export type GuidanceContextValue = {
  config: PageGuidanceConfig | null;
  pageId: GuidancePageId | null;
  persisted: GuidancePersistedState;
  registerPage: (config: PageGuidanceConfig) => void;
  unregisterPage: (pageId: GuidancePageId) => void;
  startProductTour: () => void;
  startCoachMarks: () => void;
  startWalkthrough: () => void;
  startFormTour: () => void;
  toggleChecklistItem: (id: string) => void;
  completeChecklistItem: (id: string) => void;
  dismissHotspot: (id: string) => void;
  dismissBanner: () => void;
  dismissTip: () => void;
  setOverlay: (patch: Partial<GuidancePersistedState["overlay"]>) => void;
  showChecklist: () => void;
  showWhatsNew: () => void;
  resetHotspots: () => void;
};

const GuidanceContext = createContext<GuidanceContextValue | null>(null);

export function useGuidanceContext(): GuidanceContextValue {
  const value = useContext(GuidanceContext);
  if (!value) {
    throw new Error("useGuidanceContext must be used within GuidanceProvider");
  }
  return value;
}

export function useOptionalGuidanceContext(): GuidanceContextValue | null {
  return useContext(GuidanceContext);
}

export { GuidanceContext };
