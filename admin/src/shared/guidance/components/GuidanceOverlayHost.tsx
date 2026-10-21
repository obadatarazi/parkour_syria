import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { GuidanceChecklist } from "@/shared/guidance/components/GuidanceChecklist";
import { useOptionalGuidanceContext } from "@/shared/guidance/context/GuidanceContext";
import { resolveChecklist } from "@/shared/guidance/utils/resolve-guidance-copy";

/**
 * Floating checklist only. Tip/banner render inline via GuidancePageNotices.
 */
export function GuidanceOverlayHost() {
  const t = useTranslation();
  const guidance = useOptionalGuidanceContext();
  if (!guidance?.config) return null;

  const checklist = resolveChecklist(guidance.config, t);
  const showChecklist = Boolean(checklist) && guidance.persisted.overlay.showChecklist;

  if (!showChecklist || !checklist) return null;

  return (
    <GuidanceChecklist
      title={checklist.title}
      description={checklist.description}
      progressLabel={t.guidanceChecklistProgress}
      dismissLabel={t.guidanceDismiss}
      collapseLabel={t.guidanceCollapse}
      expandLabel={t.guidanceExpand}
      dragLabel={t.guidanceDrag}
      items={checklist.items.map((item) => ({
        id: item.id,
        label: item.label,
        done: Boolean(guidance.persisted.checklist[item.id]),
      }))}
      onToggle={guidance.toggleChecklistItem}
      onDismiss={() => guidance.setOverlay({ showChecklist: false })}
    />
  );
}
