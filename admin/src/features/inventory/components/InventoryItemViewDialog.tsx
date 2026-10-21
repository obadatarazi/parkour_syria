import type { InventoryVariantRow } from "@/features/inventory/types/inventory.types";
import { getInventoryRowSku } from "@/features/inventory/utils/flatten-product-variants";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { getVariantDisplayLabel } from "@/features/products/utils/variant-attribute.utils";
import { MediaImage, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type InventoryItemViewDialogProps = {
  open: boolean;
  row: InventoryVariantRow | null;
  onOpenChange: (open: boolean) => void;
};

function stockStatusLabel(
  status: InventoryVariantRow["stockStatus"],
  t: ReturnType<typeof useTranslation>,
): string {
  if (status === "out") return t.outOfStock;
  if (status === "low") return t.lowStockCount;
  return t.inStock;
}

export function InventoryItemViewDialog({
  open,
  row,
  onOpenChange,
}: InventoryItemViewDialogProps) {
  const t = useTranslation();

  if (!row) return null;

  const sections: CrudViewDialogSection[] = [
    {
      id: "details",
      title: t.inventoryItemDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.product}>{row.product.title}</CrudDetailField>
          <CrudDetailField label={t.variantTitle}>
            {getVariantDisplayLabel(row.variant)}
          </CrudDetailField>
          <CrudDetailField label={t.brand}>{row.product.brand.title}</CrudDetailField>
          <CrudDetailField label={t.skuCode}>{getInventoryRowSku(row) || t.notSet}</CrudDetailField>
          <CrudDetailField label={t.price}>{formatKwd(row.variant.price)}</CrudDetailField>
          <CrudDetailField label={t.stock}>{row.variant.stock}</CrudDetailField>
          <CrudDetailField label={t.status}>
            {stockStatusLabel(row.stockStatus, t)}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  const imageUrl =
    row.variant.images[0]?.imageFileUrl ?? row.product.images[0]?.imageFileUrl ?? null;

  return (
    <CrudViewDialog
      open={open}
      entity={row}
      onOpenChange={onOpenChange}
      title={t.viewInventoryItem}
      cancelLabel={t.cancel}
      sections={sections}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {imageUrl ? (
            <MediaImage
              src={imageUrl}
              alt=""
              className="size-20 shrink-0 rounded-xl border border-border object-cover shadow-sm"
            />
          ) : (
            <div
              className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-background text-3xl"
              aria-hidden="true"
            >
              📦
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-lg font-semibold text-foreground">{row.product.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {getVariantDisplayLabel(row.variant)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{row.product.brand.title}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={stockStatusLabel(row.stockStatus, t)}
                variant={
                  row.stockStatus === "out"
                    ? "danger"
                    : row.stockStatus === "low"
                      ? "warning"
                      : "success"
                }
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
