import { type ReactNode,useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";

import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  GuidanceContext,
  type GuidanceContextValue,
} from "@/shared/guidance/context/GuidanceContext";
import { resolveGuidanceConfig } from "@/shared/guidance/registry";
import {
  destroyActiveTour,
  type RunTourOptions,
  startCoachMarks,
  startTour,
} from "@/shared/guidance/tours/run-tour";
import type {
  GuidancePageId,
  GuidancePersistedState,
  PageGuidanceConfig,
} from "@/shared/guidance/types/guidance.types";
import {
  defaultPersistedState,
  markFormTourSeen,
  markProductTourSeen,
  readPersistedState,
  writePersistedState,
} from "@/shared/guidance/utils/guidance-storage";
import { localizeTourSteps } from "@/shared/guidance/utils/resolve-guidance-copy";

function overlayDefaultsFor(config: PageGuidanceConfig | null) {
  if (!config) return undefined;
  const showTip = Boolean(config.autoShowTip);
  // One notice max: prefer tip over feature-discovery banner.
  const showBanner = Boolean(config.autoShowFeatureDiscovery) && !showTip;
  return { showTip, showBanner };
}

type GuidanceProviderProps = {
  children: ReactNode;
};

export function GuidanceProvider({ children }: GuidanceProviderProps) {
  const location = useLocation();
  const t = useTranslation();
  const autoTourFired = useRef<string | null>(null);
  const [overrideConfig, setOverrideConfig] = useState<PageGuidanceConfig | null>(null);
  const [persistedByPage, setPersistedByPage] = useState<
    Partial<Record<GuidancePageId, GuidancePersistedState>>
  >({});

  const routeConfig = useMemo(
    () => resolveGuidanceConfig(location.pathname) ?? null,
    [location.pathname],
  );

  useEffect(() => {
    destroyActiveTour();
  }, [location.pathname]);

  const config = overrideConfig?.pageId === routeConfig?.pageId ? overrideConfig : routeConfig;
  const pageId = config?.pageId ?? null;

  const persisted = useMemo(() => {
    if (!pageId) return defaultPersistedState();
    return (
      persistedByPage[pageId] ??
      readPersistedState(pageId, overlayDefaultsFor(config))
    );
  }, [pageId, persistedByPage, config]);

  useEffect(() => {
    if (!pageId) return;
    setPersistedByPage((prev) => {
      if (prev[pageId]) return prev;
      return {
        ...prev,
        [pageId]: readPersistedState(pageId, overlayDefaultsFor(config)),
      };
    });
  }, [pageId, config]);

  const updatePersisted = useCallback(
    (page: GuidancePageId, updater: (current: GuidancePersistedState) => GuidancePersistedState) => {
      setPersistedByPage((prev) => {
        const current =
          prev[page] ??
          readPersistedState(
            page,
            overlayDefaultsFor(config?.pageId === page ? config : null),
          );
        const next = updater(current);
        writePersistedState(page, next);
        return { ...prev, [page]: next };
      });
    },
    [config],
  );

  const tourLabels = useMemo<RunTourOptions>(
    () => ({
      next: t.guidanceTourNext ?? "Next",
      previous: t.guidanceTourPrevious ?? "Back",
      done: t.guidanceTourDone ?? "Done",
      progress: t.guidanceTourProgress ?? "{{current}} of {{total}}",
      skip: t.guidanceTourSkip ?? "Skip",
    }),
    [t],
  );

  const startProductTour = useCallback(() => {
    if (!config?.productTour.length || !pageId) return;
    const steps = localizeTourSteps(config.productTour, config, t);
    startTour(steps, {
      ...tourLabels,
      onDestroyed: () => markProductTourSeen(pageId),
    });
    updatePersisted(pageId, (current) => ({ ...current, seenProductTour: true }));
  }, [config, pageId, t, tourLabels, updatePersisted]);

  const startCoachMarksAction = useCallback(() => {
    if (!config?.coachMarks?.length) return;
    startCoachMarks(localizeTourSteps(config.coachMarks, config, t), tourLabels);
  }, [config, t, tourLabels]);

  const startWalkthroughAction = useCallback(() => {
    if (!config?.walkthrough?.length) return;
    startTour(localizeTourSteps(config.walkthrough, config, t), tourLabels);
  }, [config, t, tourLabels]);

  const startFormTourAction = useCallback(() => {
    if (!config?.formTour?.length || !pageId) return;
    const steps = localizeTourSteps(config.formTour, config, t);
    startTour(steps, {
      ...tourLabels,
      onDestroyed: () => markFormTourSeen(pageId),
    });
    updatePersisted(pageId, (current) => ({ ...current, seenFormTour: true }));
  }, [config, pageId, t, tourLabels, updatePersisted]);

  useEffect(() => {
    if (!config?.autoProductTourOnce || !pageId) return;
    if (autoTourFired.current === pageId) return;
    const state = persistedByPage[pageId] ?? readPersistedState(pageId);
    if (state.seenProductTour) {
      autoTourFired.current = pageId;
      return;
    }
    autoTourFired.current = pageId;
    const timer = window.setTimeout(() => {
      startProductTour();
    }, 450);
    return () => window.clearTimeout(timer);
  }, [config, pageId, persistedByPage, startProductTour]);

  const value = useMemo<GuidanceContextValue>(
    () => ({
      config,
      pageId,
      persisted,
      registerPage: (next) => setOverrideConfig(next),
      unregisterPage: (id) =>
        setOverrideConfig((current) => (current?.pageId === id ? null : current)),
      startProductTour,
      startCoachMarks: startCoachMarksAction,
      startWalkthrough: startWalkthroughAction,
      startFormTour: startFormTourAction,
      toggleChecklistItem: (id) => {
        if (!pageId) return;
        updatePersisted(pageId, (current) => ({
          ...current,
          checklist: { ...current.checklist, [id]: !current.checklist[id] },
        }));
      },
      completeChecklistItem: (id) => {
        if (!pageId) return;
        updatePersisted(pageId, (current) => {
          if (current.checklist[id]) return current;
          return {
            ...current,
            checklist: { ...current.checklist, [id]: true },
          };
        });
      },
      dismissHotspot: (id) => {
        if (!pageId) return;
        updatePersisted(pageId, (current) => ({
          ...current,
          hotspotsDismissed: { ...current.hotspotsDismissed, [id]: true },
        }));
      },
      dismissBanner: () => {
        if (!pageId) return;
        updatePersisted(pageId, (current) => ({
          ...current,
          bannerDismissed: true,
          overlay: { ...current.overlay, showBanner: false },
        }));
      },
      dismissTip: () => {
        if (!pageId) return;
        updatePersisted(pageId, (current) => ({
          ...current,
          tipDismissed: true,
          overlay: { ...current.overlay, showTip: false },
        }));
      },
      setOverlay: (patch) => {
        if (!pageId) return;
        updatePersisted(pageId, (current) => ({
          ...current,
          overlay: { ...current.overlay, ...patch },
        }));
      },
      showChecklist: () => {
        if (!pageId) return;
        updatePersisted(pageId, (current) => ({
          ...current,
          overlay: { ...current.overlay, showChecklist: true },
        }));
      },
      showWhatsNew: () => {
        if (!pageId) return;
        updatePersisted(pageId, (current) => ({
          ...current,
          bannerDismissed: false,
          overlay: { ...current.overlay, showBanner: true },
        }));
      },
      resetHotspots: () => {
        if (!pageId) return;
        updatePersisted(pageId, (current) => ({
          ...current,
          hotspotsDismissed: {},
          overlay: { ...current.overlay, showHotspots: true },
        }));
      },
    }),
    [
      config,
      pageId,
      persisted,
      startCoachMarksAction,
      startFormTourAction,
      startProductTour,
      startWalkthroughAction,
      updatePersisted,
    ],
  );

  return <GuidanceContext.Provider value={value}>{children}</GuidanceContext.Provider>;
}
