import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { ContextualHelpTip } from "@/shared/guidance/components/ContextualHelpTip";
import { FeatureDiscoveryBanner } from "@/shared/guidance/components/FeatureDiscoveryBanner";
import { useOptionalGuidanceContext } from "@/shared/guidance/context/GuidanceContext";
import {
  resolveContextualTip,
  resolveFeatureDiscovery,
} from "@/shared/guidance/utils/resolve-guidance-copy";

type GuidancePageNoticesProps = {
  className?: string;
};

/**
 * Inline tip + feature-discovery banners for the active page.
 * Place inside the page flow (e.g. under the header) — not fixed over the table.
 */
export function GuidancePageNotices({ className }: GuidancePageNoticesProps) {
  const t = useTranslation();
  const guidance = useOptionalGuidanceContext();
  if (!guidance?.config) return null;

  const { config, persisted } = guidance;
  const tip = resolveContextualTip(config, t);
  const feature = resolveFeatureDiscovery(config, t);

  const showTip = Boolean(tip) && persisted.overlay.showTip && !persisted.tipDismissed;
  const showBanner =
    Boolean(feature) &&
    persisted.overlay.showBanner &&
    !persisted.bannerDismissed &&
    !showTip;

  if (!showTip && !showBanner) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {showTip && tip ? (
        <ContextualHelpTip
          title={tip.title}
          description={tip.description}
          dismissLabel={t.guidanceDismiss}
          onDismiss={guidance.dismissTip}
        />
      ) : null}
      {showBanner && feature ? (
        <FeatureDiscoveryBanner
          title={feature.title}
          description={feature.description}
          dismissLabel={t.guidanceDismiss}
          onDismiss={guidance.dismissBanner}
        />
      ) : null}
    </div>
  );
}
