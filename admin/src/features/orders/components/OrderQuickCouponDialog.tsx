import { useEffect, useState } from "react";

import { couponsService } from "@/features/coupons/services/coupons.service";
import type { Coupon } from "@/features/coupons/types/coupons.types";
import {
  buildQuickOrderCouponForm,
  type QuickOrderCouponKind,
} from "@/features/orders/utils/build-quick-order-coupon";
import {
  AppButton,
  AppDialog,
  SelectField,
  TextField,
  ToggleField,
} from "@/shared/components";
import { invalidateQueryCache, useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type OrderQuickCouponDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (coupon: Coupon) => void | Promise<void>;
};

export function OrderQuickCouponDialog({
  open,
  onOpenChange,
  onCreated,
}: OrderQuickCouponDialogProps) {
  const t = useTranslation();
  const [kind, setKind] = useState<QuickOrderCouponKind>("FIXED");
  const [value, setValue] = useState("");
  const [code, setCode] = useState("");
  const [isAdminOnly, setIsAdminOnly] = useState(true);
  const [valueError, setValueError] = useState<string | undefined>();

  const createMutation = useCrudMutation({
    mutationFn: (payload: ReturnType<typeof buildQuickOrderCouponForm>) =>
      couponsService.create(payload),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.orderQuickCouponCreated,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
  });

  const { reset, isPending } = createMutation;
  const needsValue = kind !== "FREE_SHIPPING";

  useEffect(() => {
    if (!open) return;
    setKind("FIXED");
    setValue("");
    setCode("");
    setIsAdminOnly(true);
    setValueError(undefined);
    reset();
  }, [open, reset]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (needsValue) {
      const amount = Number(value);
      if (!value.trim() || !Number.isFinite(amount) || amount <= 0) {
        setValueError(t.required);
        return;
      }
      if (kind === "PERCENTAGE" && amount > 100) {
        setValueError(t.orderQuickCouponPercentMax);
        return;
      }
    }

    setValueError(undefined);

    const result = await createMutation.mutate(
      buildQuickOrderCouponForm({
        kind,
        value,
        code,
        isAdminOnly,
      }),
    );

    if (!result.ok) return;

    invalidateQueryCache("coupons");
    await onCreated(result.data);
    onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.orderQuickCoupon}
      description={t.orderQuickCouponHint}
      size="md"
      isLoading={isPending}
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <SelectField
          label={t.couponType}
          value={kind}
          onValueChange={(next) => {
            setKind(next as QuickOrderCouponKind);
            setValueError(undefined);
          }}
          options={[
            { value: "FIXED", label: t.orderQuickCouponFixed },
            { value: "PERCENTAGE", label: t.orderQuickCouponPercentage },
            { value: "FREE_SHIPPING", label: t.orderQuickCouponFreeShipping },
          ]}
          required
          disabled={isPending}
        />

        {needsValue ? (
          <TextField
            label={
              kind === "PERCENTAGE" ? t.orderQuickCouponPercentValue : t.orderQuickCouponFixedValue
            }
            type="number"
            min={0}
            max={kind === "PERCENTAGE" ? 100 : undefined}
            step={kind === "PERCENTAGE" ? "1" : "0.001"}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setValueError(undefined);
            }}
            error={valueError}
            required
            disabled={isPending}
          />
        ) : null}

        <TextField
          label={t.couponCode}
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          helperText={t.orderQuickCouponCodeHint}
          disabled={isPending}
          autoComplete="off"
        />

        <ToggleField
          label={t.couponIsAdminOnly}
          description={t.couponIsAdminOnlyHint}
          checked={isAdminOnly}
          onCheckedChange={setIsAdminOnly}
          disabled={isPending}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AppButton
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t.cancel}
          </AppButton>
          <AppButton type="submit" isLoading={isPending} loadingText={t.loadingMessage}>
            {t.orderQuickCouponCreateAndApply}
          </AppButton>
        </div>
      </form>
    </AppDialog>
  );
}
