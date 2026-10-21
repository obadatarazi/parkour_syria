import { useEffect } from "react";

import { useGuidanceContext } from "@/shared/guidance/context/GuidanceContext";
import { getGuidanceConfigByPageId } from "@/shared/guidance/registry";
import type { GuidancePageId, PageGuidanceAnchors, PageGuidanceConfig } from "@/shared/guidance/types/guidance.types";

export type CrudPageGuidanceApi = {
  config: PageGuidanceConfig;
  anchors: PageGuidanceAnchors;
  /** Spread onto CrudListPage */
  pageProps: {
    titleDataGuidance: string;
    actionsDataGuidance: string;
  };
  /** Merge into CrudListTable search/filters */
  searchDataGuidance: string;
  filtersDataGuidance: string;
  rowActionsDataGuidance: string;
  statusDataGuidance?: string;
  completeChecklistItem: (id: string) => void;
  dismissHotspot: (id: string) => void;
  isHotspotActive: (id: string) => boolean;
};

/**
 * Registers (optional override) and returns standard CRUD guidance anchors for a page.
 * Route-based config from the registry is enough for most pages; pass `config` to override.
 */
export function useCrudPageGuidance(
  pageId: GuidancePageId,
  configOverride?: PageGuidanceConfig,
): CrudPageGuidanceApi {
  const guidance = useGuidanceContext();
  const config = configOverride ?? getGuidanceConfigByPageId(pageId);

  if (!config) {
    throw new Error(`No guidance config registered for page "${pageId}"`);
  }

  useEffect(() => {
    if (!configOverride) return;
    guidance.registerPage(configOverride);
    return () => guidance.unregisterPage(configOverride.pageId);
  }, [configOverride, guidance]);

  const anchors = config.anchors;

  return {
    config,
    anchors,
    pageProps: {
      titleDataGuidance: anchors.title,
      actionsDataGuidance: anchors.add,
    },
    searchDataGuidance: anchors.search,
    filtersDataGuidance: anchors.filters,
    rowActionsDataGuidance: anchors.rowActions,
    statusDataGuidance: anchors.status,
    completeChecklistItem: guidance.completeChecklistItem,
    dismissHotspot: guidance.dismissHotspot,
    isHotspotActive: (id) =>
      Boolean(
        guidance.persisted.overlay.showHotspots &&
          config.hotspots?.some((item) => item.id === id) &&
          !guidance.persisted.hotspotsDismissed[id],
      ),
  };
}

export function usePageGuidance(config: PageGuidanceConfig) {
  const guidance = useGuidanceContext();

  useEffect(() => {
    guidance.registerPage(config);
    return () => guidance.unregisterPage(config.pageId);
  }, [config, guidance]);

  return guidance;
}
