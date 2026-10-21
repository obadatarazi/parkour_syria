import { GUIDANCE_STORAGE_PREFIX } from "@/shared/guidance/constants/guidance.constants";
import type {
  GuidanceOverlayState,
  GuidancePageId,
  GuidancePersistedState,
} from "@/shared/guidance/types/guidance.types";

const DEFAULT_OVERLAY: GuidanceOverlayState = {
  showChecklist: false,
  showTip: false,
  showBanner: false,
  showHotspots: true,
};

function storageKey(pageId: GuidancePageId): string {
  return `${GUIDANCE_STORAGE_PREFIX}:${pageId}`;
}

export function defaultPersistedState(
  overlayOverrides?: Partial<GuidanceOverlayState>,
): GuidancePersistedState {
  return {
    seenProductTour: false,
    seenFormTour: false,
    checklist: {},
    hotspotsDismissed: {},
    bannerDismissed: false,
    tipDismissed: false,
    overlay: { ...DEFAULT_OVERLAY, ...overlayOverrides },
  };
}

export function readPersistedState(
  pageId: GuidancePageId,
  overlayOverrides?: Partial<GuidanceOverlayState>,
): GuidancePersistedState {
  try {
    const raw = localStorage.getItem(storageKey(pageId));
    if (!raw) return defaultPersistedState(overlayOverrides);
    const parsed = JSON.parse(raw) as Partial<GuidancePersistedState>;
    return {
      ...defaultPersistedState(),
      ...parsed,
      checklist: { ...parsed.checklist },
      hotspotsDismissed: { ...parsed.hotspotsDismissed },
      overlay: { ...DEFAULT_OVERLAY, ...parsed.overlay },
    };
  } catch {
    return defaultPersistedState(overlayOverrides);
  }
}

export function writePersistedState(pageId: GuidancePageId, state: GuidancePersistedState) {
  localStorage.setItem(storageKey(pageId), JSON.stringify(state));
}

export function markProductTourSeen(pageId: GuidancePageId) {
  const current = readPersistedState(pageId);
  if (current.seenProductTour) return;
  writePersistedState(pageId, { ...current, seenProductTour: true });
}

export function markFormTourSeen(pageId: GuidancePageId) {
  const current = readPersistedState(pageId);
  if (current.seenFormTour) return;
  writePersistedState(pageId, { ...current, seenFormTour: true });
}
