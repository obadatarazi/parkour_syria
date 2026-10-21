export { ContextualHelpTip } from "@/shared/guidance/components/ContextualHelpTip";
export { FeatureDiscoveryBanner } from "@/shared/guidance/components/FeatureDiscoveryBanner";
export type { GuidanceChecklistItem } from "@/shared/guidance/components/GuidanceChecklist";
export { GuidanceChecklist } from "@/shared/guidance/components/GuidanceChecklist";
export {
  GuidanceDemoDock,
  type GuidanceDemoDockState,
} from "@/shared/guidance/components/GuidanceDemoDock";
export { GuidanceFloatingPanel } from "@/shared/guidance/components/GuidanceFloatingPanel";
export { GuidanceHelpMenu } from "@/shared/guidance/components/GuidanceHelpMenu";
export { GuidanceHotspot } from "@/shared/guidance/components/GuidanceHotspot";
export { GuidanceOverlayHost } from "@/shared/guidance/components/GuidanceOverlayHost";
export { GuidancePageNotices } from "@/shared/guidance/components/GuidancePageNotices";
export {
  createCrudGuidance,
  defaultFormTour,
} from "@/shared/guidance/configs/create-crud-guidance";
export {
  allGuidanceConfigs,
  carePlansGuidanceConfig,
  couponsGuidanceConfig,
  dashboardGuidanceConfig,
  homepageGuidanceConfig,
  loyaltyEventsGuidanceConfig,
  loyaltyLedgerGuidanceConfig,
  loyaltyRedemptionsGuidanceConfig,
  loyaltyRewardsGuidanceConfig,
  ordersGuidanceConfig,
  productsGuidanceConfig,
  promotionsGuidanceConfig,
} from "@/shared/guidance/configs/guidance-configs";
export { GuidanceProvider } from "@/shared/guidance/context/GuidanceProvider";
export {
  type CrudPageGuidanceApi,
  useCrudPageGuidance,
  usePageGuidance,
} from "@/shared/guidance/hooks/use-crud-page-guidance";
export {
  useGuidance,
  useOptionalGuidanceContext,
} from "@/shared/guidance/hooks/use-guidance";
export { getGuidanceConfigByPageId, resolveGuidanceConfig } from "@/shared/guidance/registry";
export {
  destroyActiveTour,
  isTourActive,
  startCoachMarks,
  startTour,
} from "@/shared/guidance/tours/run-tour";
export type {
  GuidancePageId,
  PageGuidanceAnchors,
  PageGuidanceConfig,
  TourStepDef,
} from "@/shared/guidance/types/guidance.types";
