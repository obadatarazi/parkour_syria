import { ShoppingBag } from "lucide-react";

import { formatKwd } from "@/features/products/utils/product-display.utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type OrderFormPreviewCardProps = {
  orderRefPlaceholder: string;
  statusLabel: string;
  customerName: string;
  itemCount: number;
  /** Final amount due when known (includes tax + delivery when the API computed it). */
  amountDue?: number | null;
};

export function OrderFormPreviewCard({
  orderRefPlaceholder,
  statusLabel,
  customerName,
  itemCount,
  amountDue,
}: OrderFormPreviewCardProps) {
  const t = useTranslation();
  const displayTotal =
    amountDue != null && Number.isFinite(amountDue) ? amountDue : null;

  return (
    <aside className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t.orderPreview}
        </p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {statusLabel}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground"
            aria-hidden="true"
          >
            <ShoppingBag className="size-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="truncate font-mono text-base font-semibold tracking-wide text-foreground">
              {orderRefPlaceholder}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {customerName.trim() || t.guest}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 text-xs">
        <div className="text-start">
          <p className="text-muted-foreground">{t.items}</p>
          <p className="mt-0.5 font-semibold tabular-nums text-foreground">{itemCount}</p>
        </div>
        <div className="text-start">
          <p className="text-muted-foreground">{t.totalWithTax}</p>
          <p className="mt-0.5 font-semibold tabular-nums text-foreground">
            {displayTotal != null ? formatKwd(displayTotal) : t.notSet}
          </p>
        </div>
      </div>
    </aside>
  );
}
