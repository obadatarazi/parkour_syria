import { useCallback, useRef, useState } from "react";

import { inventoryService } from "@/features/inventory/services/inventory.service";
import type { UpdateInventoryPayload } from "@/features/inventory/services/inventory.service.types";
import type { InventoryVariantRow } from "@/features/inventory/types/inventory.types";
import { getStockStatus } from "@/features/inventory/utils/flatten-product-variants";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { getServiceErrorCode, resolveServiceErrorMessage } from "@/shared/errors";
import { notify } from "@/shared/lib/notifications";

export type InventoryFieldOverrides = Partial<Record<string, { price?: number; stock?: number }>>;

type UseInventoryInlineUpdateOptions = {
  onSuccess?: () => void | Promise<void>;
};

function buildLookupCodes(row: InventoryVariantRow): Pick<UpdateInventoryPayload, "eanCode" | "skuCode"> {
  return {
    skuCode: row.variant.skuCode.trim() || row.product.skuCode?.trim() || null,
    eanCode: row.variant.eanCode.trim() || row.product.eanCode?.trim() || null,
  };
}

export function useInventoryInlineUpdate({ onSuccess }: UseInventoryInlineUpdateOptions = {}) {
  const t = useTranslation();
  const [overrides, setOverrides] = useState<InventoryFieldOverrides>({});
  const [savingKeys, setSavingKeys] = useState<Set<string>>(() => new Set());
  const savingKeysRef = useRef(savingKeys);
  savingKeysRef.current = savingKeys;

  const markSaving = useCallback((key: string, saving: boolean) => {
    setSavingKeys((current) => {
      const next = new Set(current);
      if (saving) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const getRowValues = useCallback(
    (row: InventoryVariantRow) => {
      const override = overrides[row.id];
      const price = override?.price ?? row.variant.price;
      const stock = override?.stock ?? row.variant.stock;
      return {
        price,
        stock,
        stockStatus: getStockStatus(stock),
      };
    },
    [overrides],
  );

  const updateField = useCallback(
    async (
      row: InventoryVariantRow,
      field: "price" | "stock",
      nextValue: number,
    ): Promise<boolean> => {
      const codes = buildLookupCodes(row);
      if (!codes.skuCode && !codes.eanCode) {
        notify.error(t.errorMessage, t.inventoryMissingCode);
        return false;
      }

      const savingKey = `${row.id}:${field}`;
      if (savingKeysRef.current.has(savingKey)) return false;

      const previous = getRowValues(row);
      setOverrides((current) => ({
        ...current,
        [row.id]: {
          ...current[row.id],
          [field]: nextValue,
        },
      }));
      markSaving(savingKey, true);

      try {
        await inventoryService.update({
          ...codes,
          [field]: nextValue,
        });
        await onSuccess?.();
        return true;
      } catch (caughtError) {
        setOverrides((current) => ({
          ...current,
          [row.id]: {
            ...current[row.id],
            [field]: previous[field],
          },
        }));

        const error = caughtError instanceof Error ? caughtError : new Error("Update failed");
        if (getServiceErrorCode(error) !== "session_expired") {
          notify.error(t.errorMessage, resolveServiceErrorMessage(error, t));
        }
        return false;
      } finally {
        markSaving(savingKey, false);
      }
    },
    [getRowValues, markSaving, onSuccess, t],
  );

  const isSaving = useCallback(
    (rowId: string, field?: "price" | "stock") => {
      if (field) return savingKeys.has(`${rowId}:${field}`);
      return savingKeys.has(`${rowId}:price`) || savingKeys.has(`${rowId}:stock`);
    },
    [savingKeys],
  );

  return {
    getRowValues,
    updateField,
    isSaving,
  };
}
