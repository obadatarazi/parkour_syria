import { Check, Loader2, Plus, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useCrudPermissions } from "@/features/auth";
import type { Coupon } from "@/features/coupons/types/coupons.types";
import { OrderQuickCouponDialog } from "@/features/orders/components/OrderQuickCouponDialog";
import {
  normalizeCouponCode,
  useOrderCouponPicker,
} from "@/features/orders/hooks/use-order-coupon-picker";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { AppBadge, AppButton, FormField } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { ORDER_FORM_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import { getBilingualTitle } from "@/shared/lib/translation-display.utils";

function getCouponTitle(coupon: Coupon, language: "en" | "ar"): string {
  const titles = getBilingualTitle(coupon.translations, coupon.title);
  const preferred = language === "ar" ? titles.ar : titles.en;
  return preferred || titles.en || titles.ar;
}

function getCouponValueRef(coupon: Coupon): string | null {
  if (coupon.type?.value === "FREE_SHIPPING") {
    return coupon.type.label || coupon.type.value;
  }
  if (coupon.type?.value === "PERCENTAGE" && coupon.value) {
    return `${coupon.value}%`;
  }
  if (coupon.value) {
    const amount = Number(coupon.value);
    return Number.isFinite(amount) ? formatKwd(amount) : coupon.value;
  }
  return coupon.type?.label || coupon.type?.value || null;
}

function getCouponRef(coupon: Coupon, language: "en" | "ar"): string | null {
  const title = getCouponTitle(coupon, language);
  const valueRef = getCouponValueRef(coupon);
  const parts = [title, valueRef].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

type OrderCouponPickerProps = {
  value: string[];
  onChange: (codes: string[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
};

export function OrderCouponPicker({
  value,
  onChange,
  disabled = false,
  readOnly = false,
}: OrderCouponPickerProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const { canCreate: canCreateCoupon } = useCrudPermissions(PERMISSIONS.MANAGE_COUPON);
  const fieldId = useId();
  const panelId = `${fieldId}-panel`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [refsByCode, setRefsByCode] = useState<Record<string, string>>({});

  const {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageCoupons,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useOrderCouponPicker({
    enabled: !disabled && !readOnly,
    isOpen,
  });

  const showQuickCreate = !readOnly && !disabled && canCreateCoupon;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const addCode = (raw: string, ref?: string | null) => {
    const code = normalizeCouponCode(raw);
    if (!code || value.includes(code)) return;
    onChange([...value, code]);
    if (ref) {
      setRefsByCode((current) => ({ ...current, [code]: ref }));
    }
    setSearch("");
  };

  const removeCode = (code: string) => {
    onChange(value.filter((item) => item !== code));
    setRefsByCode((current) => {
      const next = { ...current };
      delete next[code];
      return next;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCode(search);
    }
  };

  return (
    <FormField
      label={t.couponCode}
      fieldId={fieldId}
      helperText={readOnly ? t.orderCouponAppliedHint : t.orderCouponSearchHint}
    >
      <div ref={rootRef} className="space-y-2">
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {value.map((code) => (
              <span
                key={code}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-background pe-1 ps-2.5 py-0.5"
              >
                <span className="truncate text-xs">
                  <span className="font-mono font-medium">{code}</span>
                  {refsByCode[code] ? (
                    <span className="text-muted-foreground"> · {refsByCode[code]}</span>
                  ) : null}
                </span>
                {!readOnly && !disabled ? (
                  <button
                    type="button"
                    className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`${t.removeItem} ${code}`}
                    onClick={() => removeCode(code)}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : readOnly ? (
          <p className="text-sm text-muted-foreground">{t.orderCouponsEmpty}</p>
        ) : null}

        {readOnly ? null : (
          <div className="space-y-2">
            {showQuickCreate ? (
              <div
                className="flex flex-wrap items-center justify-between gap-2"
                data-guidance={ORDER_FORM_ANCHORS.quickCoupon}
              >
                <p className="text-xs text-muted-foreground">{t.orderQuickCouponShortcutHint}</p>
                <AppButton
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => {
                    setIsOpen(false);
                    setQuickOpen(true);
                  }}
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  {t.orderQuickCoupon}
                </AppButton>
              </div>
            ) : null}
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                ref={inputRef}
                id={fieldId}
                value={search}
                disabled={disabled}
                autoComplete="off"
                placeholder={t.orderCouponSearchPlaceholder}
                className="ps-9"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onFocus={() => setIsOpen(true)}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        )}

        {isOpen && !readOnly && !disabled ? (
          <div
            id={panelId}
            className="overflow-hidden rounded-lg border border-border bg-popover shadow-md"
          >
            {isLoading && pageCoupons.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t.loadingMessage}
              </div>
            ) : isError ? (
              <div className="space-y-2 px-3 py-4">
                <p className="text-sm text-destructive">{resolveServiceErrorMessage(queryError, t)}</p>
                <AppButton type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                  {t.tryAgain}
                </AppButton>
              </div>
            ) : (
              <>
                {normalizeCouponCode(search) &&
                !value.includes(normalizeCouponCode(search)) &&
                !pageCoupons.some(
                  (coupon) => normalizeCouponCode(coupon.code) === normalizeCouponCode(search),
                ) ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-start text-sm hover:bg-muted/60"
                    onClick={() => addCode(search)}
                  >
                    <AppBadge label={t.orderCouponAddCode} variant="neutral" />
                    <span className="font-mono font-medium">{normalizeCouponCode(search)}</span>
                  </button>
                ) : null}

                {pageCoupons.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">{t.orderCouponEmptyPicker}</p>
                ) : (
                  <ul className="max-h-56 overflow-auto py-1">
                    {pageCoupons.map((coupon) => {
                      const code = normalizeCouponCode(coupon.code);
                      const selected = value.includes(code);
                      const ref = getCouponRef(coupon, language);
                      return (
                        <li key={coupon.id}>
                          <button
                            type="button"
                            className={cn(
                              "flex w-full items-start gap-2 px-3 py-2 text-start hover:bg-muted/60",
                              selected && "bg-muted/40",
                            )}
                            onClick={() =>
                              selected ? removeCode(code) : addCode(code, ref)
                            }
                          >
                            <Check
                              className={cn(
                                "mt-0.5 size-4 shrink-0",
                                selected ? "text-brand" : "text-transparent",
                              )}
                              aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono text-sm font-medium">{coupon.code}</span>
                                {coupon.isAdminOnly ? (
                                  <AppBadge label={t.couponIsAdminOnlyBadge} variant="neutral" />
                                ) : null}
                              </span>
                              {ref ? (
                                <span className="block truncate text-xs text-muted-foreground">
                                  {ref}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {totalPages > 1 ? (
                  <div className="flex items-center justify-between border-t border-border px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      {t.previous}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {page} / {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((current) => current + 1)}
                    >
                      {t.nextPage}
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>

      {showQuickCreate ? (
        <OrderQuickCouponDialog
          open={quickOpen}
          onOpenChange={setQuickOpen}
          onCreated={(coupon) => {
            const code = normalizeCouponCode(coupon.code);
            const ref = getCouponRef(coupon, language);
            addCode(code, ref);
            void refetch();
          }}
        />
      ) : null}
    </FormField>
  );
}
