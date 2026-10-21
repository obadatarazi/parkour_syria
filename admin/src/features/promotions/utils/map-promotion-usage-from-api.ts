import type { PromotionUsage } from "@/features/promotions/types/promotions.types";

export function mapPromotionUsageFromApi(usage: PromotionUsage): PromotionUsage {
  return {
    ...usage,
    pricePromotions: Number(usage.pricePromotions ?? 0),
    order: usage.order
      ? {
          ...usage.order,
          totalPriceWithTax:
            usage.order.totalPriceWithTax == null
              ? null
              : Number(usage.order.totalPriceWithTax),
        }
      : null,
  };
}
