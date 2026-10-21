import type { Product, ProductImage, ProductVariant } from "@/features/products/types/products.types";
import {
  getProductStorefrontUrlForLocale,
  type StorefrontLocale,
} from "@/features/products/utils/product-storefront-url.utils";
import {
  getProductDisplayPrice,
  getProductStock,
  normalizeProductType,
} from "@/features/products/utils/variant-attribute.utils";

export function formatPriceAmount(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatKwd(amount: number): string {
  return `${formatPriceAmount(amount)} KWD`;
}

/** Sale unit price when a discount is configured; otherwise the regular price. */
export function getVariantEffectivePrice(variant: Pick<ProductVariant, "price" | "priceDiscount" | "hasDiscountPrice">): number {
  const discount = variant.priceDiscount;
  if (
    (variant.hasDiscountPrice || (discount != null && Number(discount) > 0)) &&
    discount != null &&
    Number(discount) > 0 &&
    Number(discount) < Number(variant.price)
  ) {
    return Number(discount);
  }
  return Number(variant.price);
}

export function formatVariantPriceLabel(
  variant: Pick<ProductVariant, "price" | "priceDiscount" | "hasDiscountPrice">,
): string {
  const price = Number(variant.price);
  const effective = getVariantEffectivePrice(variant);
  if (effective < price) {
    return `${formatKwd(effective)} (${formatKwd(price)})`;
  }
  return formatKwd(price);
}

export function getFeaturedProductImage(
  images: ProductImage[] | null | undefined,
): string | null {
  if (!images?.length) return null;
  const featured = images.find((image) => image.featured);
  return featured?.imageFileUrl ?? images[0]?.imageFileUrl ?? null;
}

export function getProductTotalStock(product: Product | ProductVariant[]): number {
  if (Array.isArray(product)) {
    return product.reduce((total, variant) => total + variant.stock, 0);
  }
  return getProductStock(product);
}

export function getProductMinPrice(product: Product | ProductVariant[]): number | null {
  if (Array.isArray(product)) {
    if (!product.length) return null;
    return Math.min(...product.map((variant) => variant.price));
  }
  return getProductDisplayPrice(product);
}

export function formatProductPriceLabel(product: Product, _fromLabel?: string): string {
  return getProductPriceDisplay(product).title;
}

export type ProductPriceDisplay = {
  /** Full single-line label (tooltips / copy). */
  title: string;
  /**
   * Display lines — a range uses two lines on compact screens
   * (e.g. `["13.50 –", "18.00 KWD"]`).
   */
  lines: string[];
  /** Optional compare-at / regular price label shown muted. */
  compareAt?: string;
};

/** Structured price for dense table cells (stacks ranges on ~13" screens). */
export function getProductPriceDisplay(product: Product): ProductPriceDisplay {
  const type = normalizeProductType(product.type);

  if (type === "VARIABLE_PRODUCT") {
    if (product.variants?.length) {
      const effectivePrices = product.variants.map(getVariantEffectivePrice);
      const regularPrices = product.variants.map((variant) => Number(variant.price));
      const minEffective = Math.min(...effectivePrices);
      const maxEffective = Math.max(...effectivePrices);
      const minRegular = Math.min(...regularPrices);
      const maxRegular = Math.max(...regularPrices);
      const hasSale = effectivePrices.some((price, index) => price < regularPrices[index]!);

      if (hasSale) {
        const sale = toPriceLines(minEffective, maxEffective);
        const regular = toPriceLines(minRegular, maxRegular);
        return {
          title: `${sale.title} (${regular.title})`,
          lines: sale.lines,
          compareAt: regular.title,
        };
      }

      return toPriceLines(minEffective, maxEffective);
    }

    const range = product.priceRange;
    const min = range?.min ?? getProductDisplayPrice(product);
    const max =
      range?.max ??
      (product.variants.length
        ? Math.max(...product.variants.map((variant) => variant.price))
        : null);

    if (min == null) return { title: "—", lines: ["—"] };
    if (max == null || max === min) return toPriceLines(min, min);
    return toPriceLines(min, max);
  }

  const price = getProductDisplayPrice(product);
  if (price == null) return { title: "—", lines: ["—"] };

  const discount = product.priceDiscount;
  if (
    (product.hasDiscountPrice || (discount != null && Number(discount) > 0)) &&
    discount != null &&
    discount > 0 &&
    discount < price
  ) {
    const sale = toPriceLines(discount, discount);
    const regular = toPriceLines(price, price);
    return {
      title: `${sale.title} (${regular.title})`,
      lines: sale.lines,
      compareAt: regular.title,
    };
  }

  return toPriceLines(price, price);
}

function toPriceLines(min: number, max: number): ProductPriceDisplay {
  if (min === max) {
    const title = formatKwd(min);
    return { title, lines: [title] };
  }

  const minLabel = formatPriceAmount(min);
  const maxLabel = formatPriceAmount(max);
  return {
    title: `${minLabel} – ${maxLabel} KWD`,
    lines: [`${minLabel} –`, `${maxLabel} KWD`],
  };
}

export function productStockBarColor(stock: number, lowThreshold = 5): string {
  if (stock === 0) return "bg-rose-400";
  if (stock <= lowThreshold) return "bg-amber-400";
  return "bg-emerald-400";
}

export type ProductStockLabelStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export function resolveProductStockStatus(
  product: Product,
  lowThreshold = 5,
): ProductStockLabelStatus {
  const fromApi = product.status?.value;
  if (fromApi === "IN_STOCK" || fromApi === "LOW_STOCK" || fromApi === "OUT_OF_STOCK") {
    return fromApi;
  }

  const stock = getProductTotalStock(product);
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= lowThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

function formatStockCountLabel(product: Product): string {
  const type = normalizeProductType(product.type);
  if (type === "VARIABLE_PRODUCT" && product.stockRange) {
    const { min, max } = product.stockRange;
    if (min === max) return String(min);
    return `${min}–${max}`;
  }
  return String(getProductTotalStock(product));
}

/** WordPress-style stock label: "In stock (12)", "Low stock (3)", "Out of stock". */
export function formatProductStockLabel(
  product: Product,
  labels: {
    inStock: string;
    lowStock: string;
    outOfStock: string;
  },
  lowThreshold = 5,
): { text: string; status: ProductStockLabelStatus; stock: number } {
  const stock = getProductTotalStock(product);
  const status = resolveProductStockStatus(product, lowThreshold);
  const countLabel = formatStockCountLabel(product);

  if (status === "OUT_OF_STOCK") {
    return { text: labels.outOfStock, status, stock };
  }
  if (status === "LOW_STOCK") {
    return { text: `${labels.lowStock} (${countLabel})`, status, stock };
  }
  return { text: `${labels.inStock} (${countLabel})`, status, stock };
}

export function formatProductStockRangeLabel(product: Product, fallback = "—"): string {
  const type = normalizeProductType(product.type);
  if (type === "VARIABLE_PRODUCT" && product.stockRange) {
    const { min, max } = product.stockRange;
    if (min === max) return String(min);
    return `${min}–${max}`;
  }
  return String(getProductTotalStock(product) || fallback);
}

export function getProductStorefrontUrl(
  product: Pick<Product, "translations" | "slug">,
  locale: StorefrontLocale = "en",
): string | null {
  return getProductStorefrontUrlForLocale(product, locale);
}

export function joinRelationTitles(items: { title: string }[]): string {
  return items.map((item) => item.title).join(", ");
}
