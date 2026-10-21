import { useEffect, useRef } from "react";

import {
  calcDiscountPercentageFromSalePrice,
  calcSalePriceFromDiscountPercentage,
  formatDiscountPercentageLabel,
  parseDiscountPercentageInput,
} from "@/features/products/utils/discount-percentage.utils";
import { DatePickerField, TextField } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type DiscountChange = {
  priceDiscount: number | null;
  priceDiscountPercentage: string;
  discountStartAt: string;
  discountExpireAt: string;
};

type ProductDiscountFieldsProps = {
  price: number;
  priceDiscount: number | null;
  priceDiscountPercentage: string;
  discountStartAt: string;
  discountExpireAt: string;
  onChange: (next: DiscountChange) => void;
  disabled?: boolean;
  /** Set after a failed save attempt when sale price is missing. */
  showRequiredError?: boolean;
};

export function ProductDiscountFields({
  price,
  priceDiscount,
  priceDiscountPercentage,
  discountStartAt,
  discountExpireAt,
  onChange,
  disabled = false,
  showRequiredError = false,
}: ProductDiscountFieldsProps) {
  const t = useTranslation();
  const lastEditedRef = useRef<"sale" | "percentage" | null>(null);
  const prevPriceRef = useRef(price);
  const latestRef = useRef({
    priceDiscount,
    priceDiscountPercentage,
    discountStartAt,
    discountExpireAt,
    onChange,
  });
  latestRef.current = {
    priceDiscount,
    priceDiscountPercentage,
    discountStartAt,
    discountExpireAt,
    onChange,
  };

  const salePriceMissing = priceDiscount == null || Number(priceDiscount) <= 0;
  const discountInvalid =
    priceDiscount != null && priceDiscount > 0 && Number(priceDiscount) >= Number(price);
  const salePriceError = discountInvalid
    ? t.priceDiscountMustBeLower
    : showRequiredError && salePriceMissing
      ? t.priceDiscountRequired
      : undefined;
  const expireBeforeStart =
    Boolean(discountStartAt) &&
    Boolean(discountExpireAt) &&
    discountExpireAt < discountStartAt;

  // When regular price changes, keep the last-edited side and recalculate the other.
  useEffect(() => {
    if (prevPriceRef.current === price) return;
    prevPriceRef.current = price;

    if (!Number.isFinite(price) || price <= 0) return;

    const latest = latestRef.current;
    const preferPercentage =
      lastEditedRef.current === "percentage" ||
      (!lastEditedRef.current && Boolean(latest.priceDiscountPercentage.trim()));

    if (preferPercentage) {
      const percentage = parseDiscountPercentageInput(latest.priceDiscountPercentage);
      if (percentage == null) return;
      const nextSale = calcSalePriceFromDiscountPercentage(price, percentage);
      if (nextSale == null || nextSale === latest.priceDiscount) return;
      latest.onChange({
        priceDiscount: nextSale,
        priceDiscountPercentage: formatDiscountPercentageLabel(percentage),
        discountStartAt: latest.discountStartAt,
        discountExpireAt: latest.discountExpireAt,
      });
      return;
    }

    if (latest.priceDiscount == null) return;
    const percentage = calcDiscountPercentageFromSalePrice(price, latest.priceDiscount);
    if (percentage == null) return;
    const nextPercentage = formatDiscountPercentageLabel(percentage);
    if (nextPercentage === latest.priceDiscountPercentage) return;
    latest.onChange({
      priceDiscount: latest.priceDiscount,
      priceDiscountPercentage: nextPercentage,
      discountStartAt: latest.discountStartAt,
      discountExpireAt: latest.discountExpireAt,
    });
  }, [price]);

  const emit = (next: Omit<DiscountChange, "discountStartAt" | "discountExpireAt">) => {
    onChange({
      ...next,
      discountStartAt,
      discountExpireAt,
    });
  };

  const handleSalePriceChange = (raw: string) => {
    lastEditedRef.current = "sale";
    if (raw === "") {
      emit({ priceDiscount: null, priceDiscountPercentage: "" });
      return;
    }

    const salePrice = Number(raw);
    if (!Number.isFinite(salePrice)) {
      emit({ priceDiscount: null, priceDiscountPercentage });
      return;
    }

    const percentage = calcDiscountPercentageFromSalePrice(price, salePrice);
    emit({
      priceDiscount: salePrice,
      priceDiscountPercentage:
        percentage == null ? "" : formatDiscountPercentageLabel(percentage),
    });
  };

  const handlePercentageChange = (raw: string) => {
    lastEditedRef.current = "percentage";
    // Keep `%` out of the editable value so backspace works on the number.
    const numericRaw = raw.replace(/%/g, "").trim();
    if (!numericRaw) {
      emit({ priceDiscount: null, priceDiscountPercentage: "" });
      return;
    }

    const percentage = parseDiscountPercentageInput(numericRaw);
    if (percentage == null) {
      // Keep typing in progress (e.g. intermediate "1.") without wiping sale price.
      emit({ priceDiscount, priceDiscountPercentage: numericRaw });
      return;
    }

    const nextSale = calcSalePriceFromDiscountPercentage(price, percentage);
    emit({
      priceDiscount: nextSale,
      priceDiscountPercentage: formatDiscountPercentageLabel(percentage),
    });
  };

  const percentageInputValue = priceDiscountPercentage.replace(/%/g, "").trim();

  return (
    <div className="space-y-3 rounded-lg border border-border/70 bg-background/60 p-3">
      <p className="text-xs font-medium text-muted-foreground">{t.productDiscountSection}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t.priceDiscount}
          type="number"
          min={0}
          step="0.1"
          value={priceDiscount == null ? "" : String(priceDiscount)}
          onChange={(event) => handleSalePriceChange(event.target.value)}
          disabled={disabled}
          error={salePriceError}
          helperText={t.priceDiscountHint}
        />
        <TextField
          label={t.priceDiscountPercentage}
          type="number"
          min={0}
          max={100}
          step="0.1"
          value={percentageInputValue}
          onChange={(event) => handlePercentageChange(event.target.value)}
          disabled={disabled}
          placeholder={t.priceDiscountPercentagePlaceholder}
          helperText={t.priceDiscountPercentageHint}
          error={
            showRequiredError && salePriceMissing && !percentageInputValue
              ? t.priceDiscountRequired
              : undefined
          }
          endAdornment={
            <span className="px-2 text-sm text-muted-foreground" aria-hidden="true">
              %
            </span>
          }
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePickerField
          label={t.discountStartAt}
          mode="datetime"
          value={discountStartAt}
          onChange={(nextStart) =>
            onChange({
              priceDiscount,
              priceDiscountPercentage,
              discountStartAt: nextStart,
              discountExpireAt,
            })
          }
          disablePast
          disabled={disabled}
        />
        <DatePickerField
          label={t.discountExpireAt}
          mode="datetime"
          value={discountExpireAt}
          onChange={(nextExpire) =>
            onChange({
              priceDiscount,
              priceDiscountPercentage,
              discountStartAt,
              discountExpireAt: nextExpire,
            })
          }
          disablePast
          min={discountStartAt || undefined}
          disabled={disabled}
          helperText={t.discountExpireAtHint}
          error={expireBeforeStart ? t.discountExpireMustBeAfterStart : undefined}
        />
      </div>
    </div>
  );
}
