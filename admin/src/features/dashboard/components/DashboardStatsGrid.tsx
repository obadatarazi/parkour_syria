import { DollarSign, type LucideIcon, Package, ShoppingBag, Truck, Users } from "lucide-react";

import type { DashboardStats } from "@/features/dashboard/types/dashboard.types";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { SortableWidget, SortableWidgetLayout, StatCard } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type DashboardStatsGridProps = {
  stats: DashboardStats;
};

type StatConfig = {
  key: keyof DashboardStats;
  labelKey:
    | "revenue"
    | "deliveryFees"
    | "totalOrders"
    | "activeProducts"
    | "totalCustomers";
  icon: LucideIcon;
  format?: "money";
};

const statConfigs: StatConfig[] = [
  { key: "revenue", labelKey: "revenue", icon: DollarSign, format: "money" },
  { key: "deliveryFees", labelKey: "deliveryFees", icon: Truck, format: "money" },
  { key: "totalOrders", labelKey: "totalOrders", icon: ShoppingBag },
  { key: "activeProducts", labelKey: "activeProducts", icon: Package },
  { key: "totalCustomers", labelKey: "totalCustomers", icon: Users },
];

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  const t = useTranslation();

  return (
    <SortableWidgetLayout layoutId="dashboard-stats" columns={5}>
      {statConfigs.map(({ key, labelKey, icon, format }) => {
        const stat = stats[key];
        const value =
          format === "money"
            ? formatKwd(stat.amount ?? (Number.parseFloat(stat.value.replace(/,/g, "")) || 0))
            : stat.value;

        return (
          <SortableWidget key={key} id={key} label={t[labelKey]}>
            <StatCard
              label={t[labelKey]}
              value={value}
              change={stat.change}
              trend={stat.trend}
              icon={icon}
            />
          </SortableWidget>
        );
      })}
    </SortableWidgetLayout>
  );
}
