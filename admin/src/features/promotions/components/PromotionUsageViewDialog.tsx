import { formatKwd } from "@/features/products/utils/product-display.utils";
import type { PromotionUsage } from "@/features/promotions/types/promotions.types";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type PromotionUsageViewDialogProps = {
  open: boolean;
  usage: PromotionUsage | null;
  onOpenChange: (open: boolean) => void;
};

export function PromotionUsageViewDialog({
  open,
  usage,
  onOpenChange,
}: PromotionUsageViewDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();

  if (!usage) return null;

  const sections: CrudViewDialogSection[] = [
    {
      id: "details",
      title: t.viewDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{usage.id}</CrudDetailField>
          <CrudDetailField label={t.promotionCode}>{usage.code}</CrudDetailField>
          <CrudDetailField label={t.promotions}>
            {usage.promotion?.name || usage.promotionName || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.customer}>
            {usage.user?.name ||
              usage.user?.email ||
              usage.cartUuid ||
              (usage.userId ? `#${usage.userId}` : t.notSet)}
          </CrudDetailField>
          <CrudDetailField label={t.orders}>
            {usage.order?.orderRefNumber || (usage.orderId ? `#${usage.orderId}` : t.notSet)}
          </CrudDetailField>
          <CrudDetailField label={t.promotionGivenAway}>
            {formatKwd(usage.pricePromotions)}
          </CrudDetailField>
          <CrudDetailField label={t.promotionUsedAt}>
            {usage.usedAt ? formatDateTime(usage.usedAt, language) : t.notSet}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={usage}
      onOpenChange={onOpenChange}
      title={t.promotionUsageDetail}
      cancelLabel={t.close}
      hero={
        <div className="space-y-1">
          <p className="font-mono text-lg font-semibold tracking-wide">{usage.code}</p>
          <p className="text-sm text-muted-foreground">
            {usage.promotion?.name || usage.promotionName || t.promotions}
          </p>
        </div>
      }
      sections={sections}
    />
  );
}
