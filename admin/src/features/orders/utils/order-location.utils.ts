export function parseCoord(value: string | number): number | null {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

export function hasOrderLocationCoords(
  latitude?: string | number | null,
  longitude?: string | number | null,
): boolean {
  if (latitude == null || longitude == null || latitude === "" || longitude === "") {
    return false;
  }
  return parseCoord(latitude) != null && parseCoord(longitude) != null;
}
