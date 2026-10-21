/** Round money for KWD-style amounts (up to 3 decimal places). */
export function roundDiscountMoney(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Format a numeric percent for API storage, e.g. 15 → "15%", 12.5 → "12.5%". */
export function formatDiscountPercentageLabel(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const normalized = Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace(/\.?0+$/, "");
  return `${normalized}%`;
}

/** Parse "15%", "15", "15.5" into a 0–100 number. */
export function parseDiscountPercentageInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/%/g, "").replace(",", ".");
  if (!cleaned) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0 || value > 100) return null;
  return value;
}

/** Sale price → discount percent of the regular price. */
export function calcDiscountPercentageFromSalePrice(
  regularPrice: number,
  salePrice: number,
): number | null {
  if (!Number.isFinite(regularPrice) || regularPrice <= 0) return null;
  if (!Number.isFinite(salePrice) || salePrice < 0 || salePrice >= regularPrice) return null;
  return ((regularPrice - salePrice) / regularPrice) * 100;
}

/** Discount percent → sale price. */
export function calcSalePriceFromDiscountPercentage(
  regularPrice: number,
  percentage: number,
): number | null {
  if (!Number.isFinite(regularPrice) || regularPrice <= 0) return null;
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) return null;
  if (percentage === 0) return regularPrice;
  if (percentage === 100) return 0;
  return roundDiscountMoney(regularPrice * (1 - percentage / 100));
}
