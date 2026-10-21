import { Plus, Trash2 } from "lucide-react";

import type { CouponUserFormItem } from "@/features/coupons/types/coupons.types";
import { ReviewUserPicker } from "@/features/product-reviews/components/ReviewUserPicker";
import { AppButton, DatePickerField, TextField } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CouponUserBindingsProps = {
  value: CouponUserFormItem[];
  onChange: (users: CouponUserFormItem[]) => void;
  error?: string;
  disabled?: boolean;
};

export function CouponUserBindings({
  value,
  onChange,
  error,
  disabled = false,
}: CouponUserBindingsProps) {
  const t = useTranslation();

  const updateRow = (index: number, patch: Partial<CouponUserFormItem>) => {
    onChange(value.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    onChange([
      ...value,
      {
        userId: null,
        usageLimit: 1,
        usageCount: 0,
        startsAt: "",
        expireAt: "",
      },
    ]);
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{t.couponUsers}</p>
        <AppButton type="button" variant="outline" size="sm" onClick={addRow} disabled={disabled}>
          <Plus className="size-3.5" />
          {t.addCouponUser}
        </AppButton>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.couponUsersEmpty}</p>
      ) : (
        value.map((row, index) => (
          <div
            key={`${row.userId ?? "new"}-${index}`}
            className="space-y-3 rounded-xl border border-border bg-muted/10 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <ReviewUserPicker
                  value={row.userId}
                  onChange={(userId) => updateRow(index, { userId })}
                  disabled={disabled}
                />
              </div>
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(index)}
                disabled={disabled}
                aria-label={t.deleteAction}
              >
                <Trash2 className="size-4" />
              </AppButton>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label={t.couponUsageLimit}
                type="number"
                min={1}
                value={String(row.usageLimit)}
                onChange={(event) =>
                  updateRow(index, { usageLimit: Number(event.target.value) || 1 })
                }
                disabled={disabled}
                required
              />
              <TextField
                label={t.couponUsageCount}
                type="number"
                value={String(row.usageCount)}
                readOnly
                disabled
                helperText={t.couponUsageCountReadOnlyHint}
              />
              <DatePickerField
                label={t.couponStartsAt}
                mode="datetime"
                value={row.startsAt}
                onChange={(startsAt) => updateRow(index, { startsAt })}
                disabled={disabled}
              />
              <DatePickerField
                label={t.couponExpireAt}
                mode="datetime"
                value={row.expireAt}
                onChange={(expireAt) => updateRow(index, { expireAt })}
                min={row.startsAt || undefined}
                disabled={disabled}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
