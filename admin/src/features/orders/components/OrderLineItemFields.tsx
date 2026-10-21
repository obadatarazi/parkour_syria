import { Plus, Trash2 } from "lucide-react";

import { OrderProductPicker } from "@/features/orders/components/OrderProductPicker";
import type { OrderLineItemFormData } from "@/features/orders/types/orders.types";
import { createEmptyOrderLineItem } from "@/features/orders/types/orders.types";
import { AppButton, TextField } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type OrderLineItemFieldsProps = {
  items: OrderLineItemFormData[];
  onChange: (items: OrderLineItemFormData[]) => void;
  error?: string;
};

export function OrderLineItemFields({ items, onChange, error }: OrderLineItemFieldsProps) {
  const t = useTranslation();

  const updateItem = (key: string, patch: Partial<OrderLineItemFormData>) => {
    onChange(items.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-4 pb-2">
      {items.map((item, index) => (
        <div
          key={item.key}
          className="space-y-3 overflow-visible rounded-lg border border-border bg-background p-3 sm:p-4"
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <OrderProductPicker
                label={`${t.product} ${index + 1}`}
                value={item.productId}
                required
                onSelect={(product) =>
                  updateItem(item.key, {
                    productId: product.id,
                    productVariantId: null,
                  })
                }
                onClear={() =>
                  updateItem(item.key, {
                    productId: null,
                    productVariantId: null,
                  })
                }
              />
            </div>
            <AppButton
              type="button"
              variant="ghost"
              size="icon"
              className="mt-7 shrink-0"
              disabled={items.length <= 1}
              aria-label={t.deleteAction}
              onClick={() => onChange(items.filter((row) => row.key !== item.key))}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </AppButton>
          </div>

          <div className="max-w-[8rem]">
            <TextField
              label={t.quantity}
              type="number"
              min={1}
              value={String(item.quantity)}
              onChange={(event) =>
                updateItem(item.key, {
                  quantity: Math.max(1, Number(event.target.value) || 1),
                })
              }
              required
            />
          </div>
        </div>
      ))}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <AppButton
        type="button"
        variant="outline"
        onClick={() => onChange([...items, createEmptyOrderLineItem()])}
      >
        <Plus className="size-4" aria-hidden="true" />
        {t.addOrderItem}
      </AppButton>
    </div>
  );
}
