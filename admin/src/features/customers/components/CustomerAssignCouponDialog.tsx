import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { couponsService } from "@/features/coupons/services/coupons.service";
import type { Coupon } from "@/features/coupons/types/coupons.types";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { AppBadge,AppButton, AppDialog } from "@/shared/components";
import { useCrudQuery } from "@/shared/crud";
import { Input } from "@/shared/design-system/components/ui/input";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { getBilingualTitle } from "@/shared/lib/translation-display.utils";

type CustomerAssignCouponDialogProps = {
  open: boolean;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (couponId: number) => Promise<boolean>;
};

function couponLabel(coupon: Coupon, language: "en" | "ar"): string {
  const titles = getBilingualTitle(coupon.translations, coupon.title);
  const title = language === "ar" ? titles.ar || titles.en : titles.en || titles.ar;
  const parts = [coupon.code, title].filter(Boolean);
  if (coupon.type?.value === "PERCENTAGE" && coupon.value) {
    parts.push(`${coupon.value}%`);
  } else if (coupon.type?.value === "FREE_SHIPPING") {
    parts.push(coupon.type.label);
  } else if (coupon.value) {
    const amount = Number(coupon.value);
    parts.push(Number.isFinite(amount) ? formatKwd(amount) : coupon.value);
  }
  return parts.join(" · ");
}

export function CustomerAssignCouponDialog({
  open,
  isSaving = false,
  onOpenChange,
  onAssign,
}: CustomerAssignCouponDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading, isError, error, refetch } = useCrudQuery({
    queryKey: ["coupons", "crm-assign-picker", search],
    queryFn: (signal) =>
      couponsService.list({ page: 1, limit: 20, search: search.trim() || undefined }, signal),
    enabled: open,
  });

  const coupons = data?.data ?? [];

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelectedId(null);
  }, [open]);

  const handleAssign = async () => {
    if (selectedId == null) return;
    const saved = await onAssign(selectedId);
    if (saved) onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.crmAssignCoupon}
      description={t.crmAssignCouponHint}
      size="md"
      isLoading={isSaving}
      footer={
        <>
          <AppButton
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            {t.cancel}
          </AppButton>
          <AppButton
            type="button"
            disabled={selectedId == null || isSaving}
            isLoading={isSaving}
            loadingText={t.loadingMessage}
            onClick={() => void handleAssign()}
          >
            {t.crmAssignCoupon}
          </AppButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.orderCouponSearchPlaceholder}
            className="ps-9"
            autoFocus
          />
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t.loadingMessage}
          </div>
        ) : isError ? (
          <div className="space-y-2 py-4">
            <p className="text-sm text-destructive">{resolveServiceErrorMessage(error, t)}</p>
            <AppButton type="button" variant="outline" size="sm" onClick={() => void refetch()}>
              {t.tryAgain}
            </AppButton>
          </div>
        ) : coupons.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">{t.orderCouponEmptyPicker}</p>
        ) : (
          <ul className="max-h-64 overflow-auto rounded-lg border border-border">
            {coupons.map((coupon) => {
              const selected = selectedId === coupon.id;
              return (
                <li key={coupon.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col gap-1 border-b border-border px-3 py-2.5 text-start last:border-b-0 hover:bg-muted/60",
                      selected && "bg-brand-muted/40",
                    )}
                    onClick={() => setSelectedId(coupon.id)}
                  >
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-sm font-semibold">{coupon.code}</span>
                      {coupon.isAdminOnly ? (
                        <AppBadge label={t.couponIsAdminOnlyBadge} variant="neutral" />
                      ) : null}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {couponLabel(coupon, language)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppDialog>
  );
}
