import { Percent,ShoppingBag, ShoppingCart } from "lucide-react";

import type { CartConversionStatus, CartStats } from "@/features/carts/types/carts.types";
import { StatCard, StatCardGrid } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CartStatsGridProps = {
  stats: CartStats;
  activeStatus?: CartConversionStatus | "";
  onSelectStatus?: (status: CartConversionStatus | "") => void;
};

export function CartStatsGrid({ stats, activeStatus = "", onSelectStatus }: CartStatsGridProps) {
  const t = useTranslation();

  const cards = [
    {
      key: "cartsWithNoOrders" as const,
      status: "ABANDONED" as const,
      label: t.cartsWithNoOrders,
      icon: ShoppingBag,
      higherIsBetter: false,
    },
    {
      key: "cartsWithOrders" as const,
      status: "CONVERTED" as const,
      label: t.cartsWithOrders,
      icon: ShoppingCart,
      higherIsBetter: true,
    },
    {
      key: "conversionRate" as const,
      status: "" as const,
      label: t.cartConversionRate,
      icon: Percent,
      higherIsBetter: true,
    },
  ];

  return (
    <StatCardGrid className="grid-cols-1 sm:grid-cols-3">
      {cards.map(({ key, status, label, icon, higherIsBetter }) => {
        const stat = stats[key];
        const selected = status !== "" && activeStatus === status;
        const card = (
          <StatCard
            label={label}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            higherIsBetter={higherIsBetter}
            icon={icon}
            className={cn(selected && "ring-2 ring-brand")}
          />
        );

        if (!onSelectStatus || status === "") {
          return <div key={key}>{card}</div>;
        }

        return (
          <button
            key={key}
            type="button"
            className="rounded-xl text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            onClick={() =>
              onSelectStatus(selected ? "" : status)
            }
          >
            {card}
          </button>
        );
      })}
    </StatCardGrid>
  );
}
