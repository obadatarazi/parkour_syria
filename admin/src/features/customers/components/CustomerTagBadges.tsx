import type { CrmTag } from "@/features/customers/types/customers.types";
import { StatusBadge, type StatusBadgeVariant } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const TAG_VARIANT: Record<CrmTag, StatusBadgeVariant> = {
  vip: "warning",
  care_plan: "info",
  prescription: "success",
  high_value: "info",
  inactive: "neutral",
};

type CustomerTagBadgesProps = {
  tags: CrmTag[];
};

export function CustomerTagBadges({ tags }: CustomerTagBadgesProps) {
  const t = useTranslation();

  if (tags.length === 0) return <span className="text-muted-foreground">—</span>;

  const labels: Record<CrmTag, string> = {
    vip: t.crmTagVip,
    care_plan: t.crmTagCarePlan,
    prescription: t.crmTagPrescription,
    high_value: t.crmTagHighValue,
    inactive: t.crmTagInactive,
  };

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <StatusBadge key={tag} label={labels[tag]} variant={TAG_VARIANT[tag]} />
      ))}
    </div>
  );
}
