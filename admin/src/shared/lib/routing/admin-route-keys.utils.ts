export function encodeAdminRouteKey(key: string): string {
  return encodeURIComponent(key.trim());
}

export function decodeAdminRouteKey(param: string | undefined): string | null {
  if (!param?.trim()) return null;
  try {
    return decodeURIComponent(param.trim());
  } catch {
    return param.trim();
  }
}

export function isNumericAdminRouteKey(key: string): boolean {
  return /^\d+$/.test(key.trim());
}

export function getPrescriptionRouteKey(entity: {
  prescriptionNumber?: string | null;
  id: number;
}): string {
  const number = entity.prescriptionNumber?.trim();
  if (number) return number;
  return String(entity.id);
}

export function getOrderRouteKey(entity: { orderRefNumber?: string | null; id: number }): string {
  const ref = entity.orderRefNumber?.trim();
  if (ref) return ref;
  return String(entity.id);
}

export function getProductEnglishSlug(entity: {
  slug?: string | null;
  translations?: Partial<Record<"en" | "ar", { slug?: string | null }>>;
}): string {
  return entity.translations?.en?.slug?.trim() ?? "";
}

export function getProductRouteKey(entity: {
  slug?: string | null;
  id: number;
  translations?: Partial<Record<"en" | "ar", { slug?: string | null }>>;
}): string {
  const englishSlug = getProductEnglishSlug(entity);
  if (englishSlug) return englishSlug;
  return String(entity.id);
}

export function getCouponRouteKey(entity: { code?: string | null; id: number }): string {
  const code = entity.code?.trim();
  if (code) return code;
  return String(entity.id);
}

export function getPromotionRouteKey(entity: { code?: string | null; id: number }): string {
  const code = entity.code?.trim();
  if (code) return code;
  return String(entity.id);
}
