import type { Translation } from "@/shared/design-system/localization/locales/en";
import type {
  GuidanceChecklistItemDef,
  GuidanceCopyBlock,
  PageGuidanceConfig,
  TourStepDef,
} from "@/shared/guidance/types/guidance.types";

const ORDERS_CHECKLIST_LABELS: Record<string, keyof Translation> = {
  "create-order": "guidanceChecklistCreateOrder",
  "apply-quick-coupon": "guidanceChecklistApplyQuickCoupon",
  "delivery-zones": "guidanceChecklistDeliveryZones",
  "review-filters": "guidanceChecklistReviewFilters",
  "change-status": "guidanceChecklistChangeStatus",
  "download-docs": "guidanceChecklistDownloadDocs",
};

const CRUD_CHECKLIST_LABELS: Record<string, keyof Translation> = {
  "create-first": "guidanceCrudChecklistCreate",
  "try-search": "guidanceCrudChecklistSearch",
  "try-filters": "guidanceCrudChecklistFilters",
  "try-visibility": "guidanceProductChecklistVisibility",
  "try-quick-edit": "guidanceProductChecklistQuickEdit",
  "review-widgets": "guidanceCarePlanChecklistWidgets",
  "open-lifecycle": "guidanceCarePlanChecklistLifecycle",
  "create-staff-coupon": "guidanceCouponsChecklistStaff",
  "disable-loyalty-event": "guidanceLoyaltyChecklistDisableEvent",
  "loyalty-min-cart": "guidanceLoyaltyChecklistMinCart",
};

function interpolate(template: string, entity: string): string {
  return template.replaceAll("{entity}", entity);
}

/** Best-effort entity label from the first product-tour title step. */
export function resolveEntityLabel(config: PageGuidanceConfig): string {
  return config.productTour[0]?.title ?? config.pageId;
}

export function resolveContextualTip(
  config: PageGuidanceConfig,
  t: Translation,
): GuidanceCopyBlock | null {
  if (!config.contextualTip) return null;
  if (config.pageId === "orders") {
    return {
      title: t.guidanceContextualTitle,
      description: t.guidanceContextualDescription,
    };
  }
  if (config.pageId === "products") {
    return {
      title: t.guidanceProductTipTitle,
      description: t.guidanceProductTipDescription,
    };
  }
  if (config.pageId === "dashboard") {
    return {
      title: t.guidanceDashboardTipTitle,
      description: t.guidanceDashboardTipDescription,
    };
  }
  if (config.pageId === "care-plans") {
    return {
      title: t.guidanceCarePlanTipTitle,
      description: t.guidanceCarePlanTipDescription,
    };
  }
  if (config.pageId === "homepage") {
    return {
      title: t.guidanceHomepageTipTitle,
      description: t.guidanceHomepageTipDescription,
    };
  }
  if (config.pageId === "coupons") {
    return {
      title: t.guidanceCouponsTipTitle,
      description: t.guidanceCouponsTipDescription,
    };
  }
  if (config.pageId === "loyalty-events") {
    return {
      title: t.guidanceLoyaltyEventsTipTitle,
      description: t.guidanceLoyaltyEventsTipDescription,
    };
  }
  if (config.pageId === "loyalty-rewards") {
    return {
      title: t.guidanceLoyaltyRewardsTipTitle,
      description: t.guidanceLoyaltyRewardsTipDescription,
    };
  }
  if (config.pageId === "loyalty-redemptions") {
    return {
      title: t.guidanceLoyaltyRedemptionsTipTitle,
      description: t.guidanceLoyaltyRedemptionsTipDescription,
    };
  }
  if (config.pageId === "loyalty-ledger") {
    return {
      title: t.guidanceLoyaltyLedgerTipTitle,
      description: t.guidanceLoyaltyLedgerTipDescription,
    };
  }
  return {
    title: t.guidanceCrudTipTitle,
    description: t.guidanceCrudTipDescription,
  };
}

export function resolveFeatureDiscovery(
  config: PageGuidanceConfig,
  t: Translation,
): GuidanceCopyBlock | null {
  if (!config.featureDiscovery) return null;
  if (config.pageId === "orders") {
    return {
      title: t.guidanceFeatureTitle,
      description: t.guidanceFeatureDescription,
    };
  }
  if (config.pageId === "products") {
    return {
      title: t.guidanceProductFeatureTitle,
      description: t.guidanceProductFeatureDescription,
    };
  }
  if (config.pageId === "care-plans") {
    return {
      title: t.guidanceCarePlanFeatureTitle,
      description: t.guidanceCarePlanFeatureDescription,
    };
  }
  if (config.pageId === "coupons") {
    return {
      title: t.guidanceCouponsFeatureTitle,
      description: t.guidanceCouponsFeatureDescription,
    };
  }
  return {
    title: t.guidanceCrudFeatureTitle,
    description: t.guidanceCrudFeatureDescription,
  };
}

export function resolveChecklist(
  config: PageGuidanceConfig,
  t: Translation,
): { title: string; description: string; items: GuidanceChecklistItemDef[] } | null {
  if (!config.checklist) return null;

  if (config.pageId === "orders") {
    return {
      title: t.guidanceChecklistTitle,
      description: t.guidanceChecklistDescription,
      items: config.checklist.items.map((item) => {
        const key = ORDERS_CHECKLIST_LABELS[item.id];
        return { id: item.id, label: key ? String(t[key]) : item.label };
      }),
    };
  }

  if (config.pageId === "products") {
    return {
      title: t.guidanceProductChecklistTitle,
      description: t.guidanceProductChecklistDescription,
      items: config.checklist.items.map((item) => {
        const key = CRUD_CHECKLIST_LABELS[item.id];
        const label = key ? interpolate(String(t[key]), resolveEntityLabel(config)) : item.label;
        return { id: item.id, label };
      }),
    };
  }

  if (config.pageId === "care-plans") {
    return {
      title: t.guidanceCarePlanChecklistTitle,
      description: t.guidanceCarePlanChecklistDescription,
      items: config.checklist.items.map((item) => {
        const key = CRUD_CHECKLIST_LABELS[item.id];
        const label = key ? interpolate(String(t[key]), resolveEntityLabel(config)) : item.label;
        return { id: item.id, label };
      }),
    };
  }

  if (config.pageId === "coupons") {
    return {
      title: t.guidanceCouponsChecklistTitle,
      description: t.guidanceCouponsChecklistDescription,
      items: config.checklist.items.map((item) => {
        const key = CRUD_CHECKLIST_LABELS[item.id];
        const label = key ? interpolate(String(t[key]), resolveEntityLabel(config)) : item.label;
        return { id: item.id, label };
      }),
    };
  }

  if (config.pageId === "loyalty-events") {
    return {
      title: t.guidanceLoyaltyEventsChecklistTitle,
      description: t.guidanceLoyaltyEventsChecklistDescription,
      items: config.checklist.items.map((item) => {
        const key = CRUD_CHECKLIST_LABELS[item.id];
        const label = key ? interpolate(String(t[key]), resolveEntityLabel(config)) : item.label;
        return { id: item.id, label };
      }),
    };
  }

  if (config.pageId === "loyalty-rewards") {
    return {
      title: t.guidanceLoyaltyRewardsChecklistTitle,
      description: t.guidanceLoyaltyRewardsChecklistDescription,
      items: config.checklist.items.map((item) => {
        const key = CRUD_CHECKLIST_LABELS[item.id];
        const label = key ? interpolate(String(t[key]), resolveEntityLabel(config)) : item.label;
        return { id: item.id, label };
      }),
    };
  }

  if (config.pageId === "loyalty-redemptions") {
    return {
      title: t.guidanceLoyaltyRedemptionsChecklistTitle,
      description: t.guidanceLoyaltyRedemptionsChecklistDescription,
      items: config.checklist.items.map((item) => {
        const key = CRUD_CHECKLIST_LABELS[item.id];
        const label = key ? interpolate(String(t[key]), resolveEntityLabel(config)) : item.label;
        return { id: item.id, label };
      }),
    };
  }

  if (config.pageId === "loyalty-ledger") {
    return {
      title: t.guidanceLoyaltyLedgerChecklistTitle,
      description: t.guidanceLoyaltyLedgerChecklistDescription,
      items: config.checklist.items.map((item) => {
        const key = CRUD_CHECKLIST_LABELS[item.id];
        const label = key ? interpolate(String(t[key]), resolveEntityLabel(config)) : item.label;
        return { id: item.id, label };
      }),
    };
  }

  const entity = resolveEntityLabel(config);
  return {
    title: interpolate(t.guidanceCrudChecklistTitle, entity),
    description: t.guidanceCrudChecklistDescription,
    items: config.checklist.items.map((item) => {
      const key = CRUD_CHECKLIST_LABELS[item.id];
      const label = key ? interpolate(String(t[key]), entity) : item.label;
      return { id: item.id, label };
    }),
  };
}

const TOUR_COPY: Record<
  string,
  { title: keyof Translation; description: keyof Translation }
> = {
  search: { title: "guidanceCrudSearchTitle", description: "guidanceCrudSearchDescription" },
  filters: { title: "guidanceCrudFiltersTitle", description: "guidanceCrudFiltersDescription" },
  add: { title: "guidanceCrudAddTitle", description: "guidanceCrudAddDescription" },
  "row-actions": {
    title: "guidanceCrudActionsTitle",
    description: "guidanceCrudActionsDescription",
  },
  status: { title: "guidanceTourStatusTitle", description: "guidanceTourStatusDescription" },
  "coach-add": { title: "guidanceCrudCoachAddTitle", description: "guidanceCrudCoachAddDescription" },
  "coach-search": {
    title: "guidanceCrudCoachSearchTitle",
    description: "guidanceCrudCoachSearchDescription",
  },
  "coach-status": { title: "guidanceCoachStatusTitle", description: "guidanceCoachStatusDescription" },
  "walk-intro": {
    title: "guidanceCrudWalkIntroTitle",
    description: "guidanceCrudWalkIntroDescription",
  },
  "walk-add": {
    title: "guidanceCrudWalkClickTitle",
    description: "guidanceCrudWalkClickDescription",
  },
  "walk-done": {
    title: "guidanceCrudWalkDoneTitle",
    description: "guidanceCrudWalkDoneDescription",
  },
  "form-drawer": {
    title: "guidanceFormDrawerTitle",
    description: "guidanceFormDrawerDescription",
  },
  "form-title": {
    title: "guidanceFormTitleTitle",
    description: "guidanceFormTitleDescription",
  },
  "form-body": {
    title: "guidanceFormBodyTitle",
    description: "guidanceFormBodyDescription",
  },
  "form-visibility": {
    title: "guidanceFormVisibilityTitle",
    description: "guidanceFormVisibilityDescription",
  },
  "form-actions": {
    title: "guidanceFormActionsTitle",
    description: "guidanceFormActionsDescription",
  },
  "product-tabs": {
    title: "guidanceProductTabsTitle",
    description: "guidanceProductTabsDescription",
  },
  "product-tab-general": {
    title: "guidanceProductTabGeneralTitle",
    description: "guidanceProductTabGeneralDescription",
  },
  "product-type": {
    title: "guidanceProductTypeTitle",
    description: "guidanceProductTypeDescription",
  },
  "product-visibility": {
    title: "guidanceProductVisibilityTitle",
    description: "guidanceProductVisibilityDescription",
  },
  visibility: {
    title: "guidanceProductListVisibilityTitle",
    description: "guidanceProductListVisibilityDescription",
  },
  "product-tab-content": {
    title: "guidanceProductTabContentTitle",
    description: "guidanceProductTabContentDescription",
  },
  "product-content": {
    title: "guidanceProductContentTitle",
    description: "guidanceProductContentDescription",
  },
  "product-tab-seo": {
    title: "guidanceProductTabSeoTitle",
    description: "guidanceProductTabSeoDescription",
  },
  "product-seo": {
    title: "guidanceProductSeoTitle",
    description: "guidanceProductSeoDescription",
  },
  "product-tab-media": {
    title: "guidanceProductTabMediaTitle",
    description: "guidanceProductTabMediaDescription",
  },
  "product-media": {
    title: "guidanceProductMediaTitle",
    description: "guidanceProductMediaDescription",
  },
  "product-tab-attributes": {
    title: "guidanceProductTabAttributesTitle",
    description: "guidanceProductTabAttributesDescription",
  },
  "product-attributes": {
    title: "guidanceProductAttributesTitle",
    description: "guidanceProductAttributesDescription",
  },
  "coach-visibility": {
    title: "guidanceProductCoachVisibilityTitle",
    description: "guidanceProductCoachVisibilityDescription",
  },
  "coach-row-actions": {
    title: "guidanceProductCoachRowActionsTitle",
    description: "guidanceProductCoachRowActionsDescription",
  },
  welcome: {
    title: "guidanceDashboardWelcomeTitle",
    description: "guidanceDashboardWelcomeDescription",
  },
  stats: {
    title: "guidanceDashboardStatsTitle",
    description: "guidanceDashboardStatsDescription",
  },
  charts: {
    title: "guidanceDashboardChartsTitle",
    description: "guidanceDashboardChartsDescription",
  },
  "recent-orders": {
    title: "guidanceDashboardRecentOrdersTitle",
    description: "guidanceDashboardRecentOrdersDescription",
  },
  attention: {
    title: "guidanceDashboardAttentionTitle",
    description: "guidanceDashboardAttentionDescription",
  },
  "nav-products": {
    title: "guidanceDashboardNavProductsTitle",
    description: "guidanceDashboardNavProductsDescription",
  },
  "nav-orders": {
    title: "guidanceDashboardNavOrdersTitle",
    description: "guidanceDashboardNavOrdersDescription",
  },
  "nav-care-plans": {
    title: "guidanceDashboardNavCarePlansTitle",
    description: "guidanceDashboardNavCarePlansDescription",
  },
  "coach-stats": {
    title: "guidanceDashboardCoachStatsTitle",
    description: "guidanceDashboardCoachStatsDescription",
  },
  "coach-attention": {
    title: "guidanceDashboardCoachAttentionTitle",
    description: "guidanceDashboardCoachAttentionDescription",
  },
  "care-plan-widgets": {
    title: "guidanceCarePlanWidgetsTitle",
    description: "guidanceCarePlanWidgetsDescription",
  },
  "care-plan-lifecycle": {
    title: "guidanceCarePlanLifecycleTitle",
    description: "guidanceCarePlanLifecycleDescription",
  },
  "coach-widgets": {
    title: "guidanceCarePlanCoachWidgetsTitle",
    description: "guidanceCarePlanCoachWidgetsDescription",
  },
  "care-plan-workspace": {
    title: "guidanceCarePlanWorkspaceTitle",
    description: "guidanceCarePlanWorkspaceDescription",
  },
  "care-plan-basics": {
    title: "guidanceCarePlanBasicsTitle",
    description: "guidanceCarePlanBasicsDescription",
  },
  "care-plan-sections": {
    title: "guidanceCarePlanSectionsTitle",
    description: "guidanceCarePlanSectionsDescription",
  },
  "care-plan-save": {
    title: "guidanceCarePlanSaveTitle",
    description: "guidanceCarePlanSaveDescription",
  },
  "homepage-tabs": {
    title: "guidanceHomepageTabsTitle",
    description: "guidanceHomepageTabsDescription",
  },
  "homepage-preview": {
    title: "guidanceHomepagePreviewTitle",
    description: "guidanceHomepagePreviewDescription",
  },
  "coach-homepage-tabs": {
    title: "guidanceHomepageCoachTabsTitle",
    description: "guidanceHomepageCoachTabsDescription",
  },
  "coupon-not-loyalty": {
    title: "guidanceCouponNotLoyaltyTitle",
    description: "guidanceCouponNotLoyaltyDescription",
  },
  "coupon-form-workspace": {
    title: "guidanceCouponFormWorkspaceTitle",
    description: "guidanceCouponFormWorkspaceDescription",
  },
  "coupon-form-rules": {
    title: "guidanceCouponFormRulesTitle",
    description: "guidanceCouponFormRulesDescription",
  },
  "coupon-form-staff-only": {
    title: "guidanceCouponFormStaffOnlyTitle",
    description: "guidanceCouponFormStaffOnlyDescription",
  },
  "loyalty-not-coupon": {
    title: "guidanceLoyaltyNotCouponTitle",
    description: "guidanceLoyaltyNotCouponDescription",
  },
  "loyalty-readonly": {
    title: "guidanceLoyaltyReadonlyTitle",
    description: "guidanceLoyaltyReadonlyDescription",
  },
  "loyalty-reward-min-cart": {
    title: "guidanceLoyaltyRewardMinCartTitle",
    description: "guidanceLoyaltyRewardMinCartDescription",
  },
};

export function localizeTourSteps(
  steps: TourStepDef[],
  config: PageGuidanceConfig,
  t: Translation,
): TourStepDef[] {
  const entity = resolveEntityLabel(config);

  return steps.map((step) => {
    if (config.pageId === "orders") {
      const ordersMap: Record<string, { title: keyof Translation; description: keyof Translation }> =
        {
          title: { title: "guidanceTourTitleTitle", description: "guidanceTourTitleDescription" },
          search: { title: "guidanceTourSearchTitle", description: "guidanceTourSearchDescription" },
          filters: {
            title: "guidanceTourFiltersTitle",
            description: "guidanceTourFiltersDescription",
          },
          add: { title: "guidanceTourAddTitle", description: "guidanceTourAddDescription" },
          status: { title: "guidanceTourStatusTitle", description: "guidanceTourStatusDescription" },
          "row-actions": {
            title: "guidanceTourActionsTitle",
            description: "guidanceTourActionsDescription",
          },
          "coach-add": {
            title: "guidanceCoachAddTitle",
            description: "guidanceCoachAddDescription",
          },
          "coach-search": {
            title: "guidanceCoachSearchTitle",
            description: "guidanceCoachSearchDescription",
          },
          "coach-status": {
            title: "guidanceCoachStatusTitle",
            description: "guidanceCoachStatusDescription",
          },
          "walk-intro": {
            title: "guidanceWalkIntroTitle",
            description: "guidanceWalkIntroDescription",
          },
          "walk-add": {
            title: "guidanceWalkClickTitle",
            description: "guidanceWalkClickDescription",
          },
          "walk-done": {
            title: "guidanceWalkDoneTitle",
            description: "guidanceOrderWalkDoneDescription",
          },
          "form-drawer": {
            title: "guidanceFormDrawerTitle",
            description: "guidanceFormDrawerDescription",
          },
          "form-title": {
            title: "guidanceFormTitleTitle",
            description: "guidanceFormTitleDescription",
          },
          "form-body": {
            title: "guidanceFormBodyTitle",
            description: "guidanceFormBodyDescription",
          },
          "order-form-workspace": {
            title: "guidanceOrderFormWorkspaceTitle",
            description: "guidanceOrderFormWorkspaceDescription",
          },
          "order-form-coupons-nav": {
            title: "guidanceOrderFormCouponsNavTitle",
            description: "guidanceOrderFormCouponsNavDescription",
          },
          "order-form-quick-coupon": {
            title: "guidanceOrderFormQuickCouponTitle",
            description: "guidanceOrderFormQuickCouponDescription",
          },
          "form-actions": {
            title: "guidanceFormActionsTitle",
            description: "guidanceFormActionsDescription",
          },
        };
      const keys = ordersMap[step.id];
      if (!keys) return step;
      return {
        ...step,
        title: String(t[keys.title]),
        description: String(t[keys.description]),
      };
    }

    if (step.id === "title") {
      if (config.pageId === "care-plans") {
        return {
          ...step,
          title: t.carePlans,
          description: t.guidanceCarePlanListDescription,
        };
      }
      if (config.pageId === "homepage") {
        return {
          ...step,
          title: t.homepageCms,
          description: t.guidanceHomepageListDescription,
        };
      }
      if (config.pageId === "coupons") {
        return {
          ...step,
          title: t.coupons,
          description: t.guidanceCouponsListDescription,
        };
      }
      if (config.pageId === "loyalty-events") {
        return {
          ...step,
          title: t.loyaltyEvents,
          description: t.guidanceLoyaltyEventsListDescription,
        };
      }
      if (config.pageId === "loyalty-rewards") {
        return {
          ...step,
          title: t.loyaltyRewards,
          description: t.guidanceLoyaltyRewardsListDescription,
        };
      }
      if (config.pageId === "loyalty-redemptions") {
        return {
          ...step,
          title: t.loyaltyRedemptions,
          description: t.guidanceLoyaltyRedemptionsListDescription,
        };
      }
      if (config.pageId === "loyalty-ledger") {
        return {
          ...step,
          title: t.loyaltyLedger,
          description: t.guidanceLoyaltyLedgerListDescription,
        };
      }
      return {
        ...step,
        title: entity,
        description: interpolate(t.guidanceCrudWorkspaceDescription, entity),
      };
    }

    const keys = TOUR_COPY[step.id];
    if (!keys) return step;
    return {
      ...step,
      title: interpolate(String(t[keys.title]), entity),
      description: interpolate(String(t[keys.description]), entity),
    };
  });
}
