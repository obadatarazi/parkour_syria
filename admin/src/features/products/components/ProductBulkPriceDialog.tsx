import { useEffect, useState } from "react";

import type {
  ProductBulkAdjustPriceDirection,
  ProductBulkAdjustPriceMode,
} from "@/features/products/services/products.service.types";
import { AppButton, FormRow, SelectField, TextField } from "@/shared/components";
import { CrudEntityDialog } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export type ProductBulkPriceSubmit = {
  direction: ProductBulkAdjustPriceDirection;
  mode: ProductBulkAdjustPriceMode;
  value: number;
};

type ProductBulkPriceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  simpleCount: number;
  variableCount: number;
  isLoading?: boolean;
  onSubmit: (payload: ProductBulkPriceSubmit) => void | Promise<unknown>;
};

function parsePositiveValue(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function ProductBulkPriceDialog({
  open,
  onOpenChange,
  selectedCount,
  simpleCount,
  variableCount,
  isLoading = false,
  onSubmit,
}: ProductBulkPriceDialogProps) {
  const t = useTranslation();
  const [direction, setDirection] = useState<ProductBulkAdjustPriceDirection>("increase");
  const [mode, setMode] = useState<ProductBulkAdjustPriceMode>("amount");
  const [valueInput, setValueInput] = useState("");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) {
      setDirection("increase");
      setMode("amount");
      setValueInput("");
      setError(undefined);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (simpleCount === 0) {
      setError(t.bulkEditPriceNoSimple);
      return;
    }

    const value = parsePositiveValue(valueInput);
    if (value == null) {
      setError(t.bulkEditPriceInvalid);
      return;
    }

    if (mode === "percent" && direction === "decrease" && value > 100) {
      setError(t.bulkEditPricePercentMax);
      return;
    }

    setError(undefined);
    await onSubmit({ direction, mode, value });
  };

  return (
    <CrudEntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.bulkEditPriceTitle.replace("{count}", String(selectedCount))}
      description={t.bulkEditPriceDescription}
      size="sm"
      isLoading={isLoading}
      footer={
        <>
          <AppButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t.cancel}
          </AppButton>
          <AppButton type="button" onClick={() => void handleSubmit()} isLoading={isLoading}>
            {t.save}
          </AppButton>
        </>
      }
    >
      <div className="space-y-4">
        <FormRow columns={2}>
          <SelectField
            label={t.bulkEditPriceDirection}
            value={direction}
            onValueChange={(next) => {
              setDirection(next as ProductBulkAdjustPriceDirection);
              if (error) setError(undefined);
            }}
            options={[
              { value: "increase", label: t.bulkEditPriceIncrease },
              { value: "decrease", label: t.bulkEditPriceDecrease },
            ]}
            required
          />
          <SelectField
            label={t.bulkEditPriceMode}
            value={mode}
            onValueChange={(next) => {
              setMode(next as ProductBulkAdjustPriceMode);
              if (error) setError(undefined);
            }}
            options={[
              { value: "amount", label: t.bulkEditPriceAmount },
              { value: "percent", label: t.bulkEditPricePercent },
            ]}
            required
          />
        </FormRow>
        <TextField
          label={t.bulkEditPriceValue}
          type="number"
          min={0.01}
          max={mode === "percent" && direction === "decrease" ? 100 : undefined}
          step={mode === "percent" ? "0.1" : "0.01"}
          dir="ltr"
          value={valueInput}
          onChange={(event) => {
            setValueInput(event.target.value);
            if (error) setError(undefined);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          error={error}
          endAdornment={
            <span className="pe-2 text-xs text-muted-foreground">
              {mode === "percent" ? "%" : t.kwd}
            </span>
          }
          required
        />
        {variableCount > 0 ? (
          <p className="text-xs text-muted-foreground">
            {t.bulkEditPriceVariableHint
              .replace("{simpleCount}", String(simpleCount))
              .replace("{variableCount}", String(variableCount))}
          </p>
        ) : null}
      </div>
    </CrudEntityDialog>
  );
}
