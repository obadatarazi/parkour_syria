/**
 * Mirrors the backend slug generation so the admin preview matches what will
 * actually be saved. See `Str::slug($title, '-')` (English) and
 * `slugifyArabic()` (Arabic) in `CategoryService`/`BrandService` on the API.
 */

const ASCII_TRANSLITERATION_MAP: Record<string, string> = {
  ß: "ss",
  æ: "ae",
  œ: "oe",
  ø: "o",
  đ: "d",
  ł: "l",
  ð: "d",
  þ: "th",
};

export function slugifyEnglishTitle(title: string): string {
  let value = title.toLowerCase();

  for (const [from, to] of Object.entries(ASCII_TRANSLITERATION_MAP)) {
    value = value.split(from).join(to);
  }

  value = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  value = value.replace(/[^a-z0-9\s-]/g, "");
  value = value.trim().replace(/[\s_-]+/g, "-");

  return value.replace(/^-+|-+$/g, "");
}

export function slugifyArabicTitle(title: string): string {
  return title.trim().replace(/\s+/g, "-");
}
