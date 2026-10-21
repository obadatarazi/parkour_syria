import {
  HeartPulse,
  PauseCircle,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import type { CrmSegment, CrmStats } from "@/features/customers/types/customers.types";
import { StatCard, StatCardGrid } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type StatKey = keyof Omit<CrmStats, "highValueMinSpend">;

type CrmStatsGridProps = {
  stats: CrmStats;
  activeSegment?: CrmSegment | "";
  onSelectSegment?: (segment: CrmSegment | "") => void;
};

const CARD_META: {
  key: StatKey;
  segment: CrmSegment | "";
  labelKey:
    | "totalCustomers"
    | "newCustomers"
    | "crmCarePlanSubscribers"
    | "crmInactiveCustomers"
    | "crmBigSpenders"
    | "crmRetentionRate";
  icon: typeof Users;
}[] = [
  { key: "totalCustomers", segment: "", labelKey: "totalCustomers", icon: Users },
  { key: "newCustomers", segment: "new_buyers", labelKey: "newCustomers", icon: UserPlus },
  {
    key: "carePlanSubscribers",
    segment: "care_plan",
    labelKey: "crmCarePlanSubscribers",
    icon: HeartPulse,
  },
  {
    key: "inactiveCustomers",
    segment: "inactive",
    labelKey: "crmInactiveCustomers",
    icon: UserMinus,
  },
  { key: "bigSpenders", segment: "big_spenders", labelKey: "crmBigSpenders", icon: Wallet },
  { key: "retentionRate", segment: "repeat_buyers", labelKey: "crmRetentionRate", icon: TrendingUp },
];

export function CrmStatsGrid({ stats, activeSegment = "", onSelectSegment }: CrmStatsGridProps) {
  const t = useTranslation();

  return (
    <StatCardGrid className="grid-cols-2 xl:grid-cols-6">
      {CARD_META.map(({ key, segment, labelKey, icon }) => {
        const stat = stats[key];
        const selected = activeSegment === segment && segment !== "";
        const card = (
          <StatCard
            label={t[labelKey]}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={key === "inactiveCustomers" ? PauseCircle : icon}
            className={cn(selected && "ring-2 ring-brand")}
          />
        );

        if (!onSelectSegment) return <div key={key}>{card}</div>;

        return (
          <button
            key={key}
            type="button"
            className="rounded-xl text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            onClick={() => onSelectSegment(selected || segment === "" ? "" : segment)}
          >
            {card}
          </button>
        );
      })}
    </StatCardGrid>
  );
}
