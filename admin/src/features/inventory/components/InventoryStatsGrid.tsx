import { AlertTriangle, Package, PackageCheck, PackageX } from "lucide-react";

import type { InventorySummary, StockStatus } from "@/features/inventory/types/inventory.types";
import { StatCard, StatCardGrid } from "@/shared/components";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type InventoryStatsGridProps = {
  summary: InventorySummary;
  activeStockStatus: string;
  onSelectStockStatus: (status: StockStatus | "") => void;
};

const CARD_META: {
  key: keyof InventorySummary;
  status: StockStatus | "";
  labelKey: "totalSkus" | "inStock" | "lowStockCount" | "outOfStock";
  icon: typeof Package;
  iconTone: "brand" | "success" | "warning" | "danger";
}[] = [
  { key: "totalSkus", status: "", labelKey: "totalSkus", icon: Package, iconTone: "brand" },
  { key: "inStockCount", status: "in", labelKey: "inStock", icon: PackageCheck, iconTone: "success" },
  { key: "lowStockCount", status: "low", labelKey: "lowStockCount", icon: AlertTriangle, iconTone: "warning" },
  { key: "outOfStock", status: "out", labelKey: "outOfStock", icon: PackageX, iconTone: "danger" },
];

export function InventoryStatsGrid({
  summary,
  activeStockStatus,
  onSelectStockStatus,
}: InventoryStatsGridProps) {
  const t = useTranslation();
  const normalizedActive =
    activeStockStatus && activeStockStatus !== CRUD_FILTER_ALL_VALUE ? activeStockStatus : "";

  return (
    <StatCardGrid className="mb-5">
      {CARD_META.map(({ key, status, labelKey, icon, iconTone }) => {
        const selected = normalizedActive === status && status !== "";
        return (
          <button
            key={key}
            type="button"
            className="rounded-xl text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            onClick={() => onSelectStockStatus(selected || status === "" ? "" : status)}
          >
            <StatCard
              label={t[labelKey]}
              value={String(summary[key])}
              icon={icon}
              iconTone={iconTone}
              className={cn(selected && "ring-2 ring-brand")}
            />
          </button>
        );
      })}
    </StatCardGrid>
  );
}
