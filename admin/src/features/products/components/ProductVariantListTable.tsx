import type { Product, ProductVariant } from "@/features/products/types/products.types";
import {
  formatKwd,
  getFeaturedProductImage,
  getVariantEffectivePrice,
} from "@/features/products/utils/product-display.utils";
import {
  getVariantDisplayLabel,
  normalizeProductType,
} from "@/features/products/utils/variant-attribute.utils";
import { MediaImage } from "@/shared/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/design-system/components/ui/table";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type VariantListRow = {
  key: string;
  imageUrl: string | null;
  combination: string;
  idLabel: string;
  sku: string;
  barcode: string;
  originalPrice: number | null;
  salePrice: number | null;
  quantity: number | string;
};

function buildVariantRows(product: Product): VariantListRow[] {
  if (normalizeProductType(product.type) !== "VARIABLE_PRODUCT") {
    return [];
  }

  return (product.variants ?? []).map((variant: ProductVariant, index) => {
    const originalPrice = Number(variant.price);
    const salePrice = getVariantEffectivePrice(variant);
    return {
      key: String(variant.id ?? `variant-${index}`),
      imageUrl: getFeaturedProductImage(variant.images),
      combination: getVariantDisplayLabel(variant, "—"),
      idLabel: String(variant.id ?? "—"),
      sku: variant.skuCode?.trim() || "—",
      barcode: variant.eanCode?.trim() || "—",
      originalPrice: Number.isFinite(originalPrice) ? originalPrice : null,
      salePrice: Number.isFinite(salePrice) ? salePrice : null,
      quantity: variant.stock,
    };
  });
}

export function ProductVariantListTable({ product }: { product: Product }) {
  const t = useTranslation();
  const rows = buildVariantRows(product);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold tracking-tight text-foreground">{t.productVariantList}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 whitespace-nowrap">{t.srColumn}</TableHead>
            <TableHead className="w-16">{t.image}</TableHead>
            <TableHead>{t.combination}</TableHead>
            <TableHead>{t.skuCode}</TableHead>
            <TableHead>{t.barcode}</TableHead>
            <TableHead className="text-end">{t.originalPrice}</TableHead>
            <TableHead className="text-end">{t.priceDiscount}</TableHead>
            <TableHead className="text-end">{t.quantity}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.key}>
              <TableCell className="text-muted-foreground">{index + 1}</TableCell>
              <TableCell>
                {row.imageUrl ? (
                  <MediaImage
                    src={row.imageUrl}
                    alt=""
                    className="size-10 rounded-md object-cover"
                  />
                ) : (
                  <span
                    className="flex size-10 items-center justify-center rounded-md bg-muted text-[10px] text-muted-foreground"
                    aria-hidden="true"
                  >
                    —
                  </span>
                )}
              </TableCell>
              <TableCell>
                <p className="font-semibold text-foreground">{row.combination}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">({row.idLabel})</p>
              </TableCell>
              <TableCell className="whitespace-nowrap">{row.sku}</TableCell>
              <TableCell className="whitespace-nowrap">{row.barcode}</TableCell>
              <TableCell className="text-end whitespace-nowrap">
                {row.originalPrice != null ? formatKwd(row.originalPrice) : "—"}
              </TableCell>
              <TableCell className="text-end whitespace-nowrap">
                {row.salePrice != null ? formatKwd(row.salePrice) : "—"}
              </TableCell>
              <TableCell className="text-end">{row.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
