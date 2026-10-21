/**
 * Intl locale tag for the dashboard language. Arabic keeps its month/day names and RTL punctuation but
 * always uses Latin digits (0-9), matching the public site, instead of Arabic-Indic ones (٠-٩).
 */
export function intlLocale(language: string, englishTag = "en-US"): string {
  return language === "ar" ? "ar-u-nu-latn" : englishTag;
}

/**
 * Formats an ISO/API datetime for list tables (WordPress-style readable date).
 */
export function formatDateTime(
  value: string | null | undefined,
  locale: "en" | "ar" = "en",
): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const localeTag = intlLocale(locale);

  const datePart = new Intl.DateTimeFormat(localeTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat(localeTag, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return locale === "ar" ? `${datePart} · ${timePart}` : `${datePart} at ${timePart}`;
}

const CARE_PLAN_DISPLAY_TIMEZONE = "Asia/Kuwait";

function parseApiDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(`${trimmed}T12:00:00+03:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const iso = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
  const withZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}+03:00`;
  const date = new Date(withZone);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Delivery calendar day: weekday + date, no clock time.
 * Care Plan boxes are scheduled on the preferred weekday at midnight Kuwait time.
 */
export function formatDeliveryDate(
  value: string | null | undefined,
  locale: "en" | "ar" = "en",
): string {
  if (!value) return "—";

  const date = parseApiDate(value);
  if (!date) return value;

  const localeTag = intlLocale(locale);
  return new Intl.DateTimeFormat(localeTag, {
    timeZone: CARE_PLAN_DISPLAY_TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Shorter datetime for dense list tables (fits ~13" screens).
 * Omits year when it matches the current year.
 */
export function formatTableDateTime(
  value: string | null | undefined,
  locale: "en" | "ar" = "en",
): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const localeTag = intlLocale(locale);
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();

  const datePart = new Intl.DateTimeFormat(localeTag, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date);

  const timePart = new Intl.DateTimeFormat(localeTag, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return `${datePart}, ${timePart}`;
}

/** Local calendar day at 00:00:00. */
export function startOfLocalDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** `YYYY-MM-DD` from a local Date. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** `YYYY-MM-DDTHH:mm` from a local Date (datetime-local compatible). */
export function toDatetimeLocalInputValue(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${toDateInputValue(date)}T${hours}:${minutes}`;
}

/**
 * Parse `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm` (also tolerates space separator) into a local Date.
 */
export function parseDateInputValue(value: string | null | undefined): Date | undefined {
  if (!value?.trim()) return undefined;

  const normalized = value.trim().replace(" ", "T");
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(normalized);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hours = Number(match[4] ?? "0");
  const minutes = Number(match[5] ?? "0");
  const date = new Date(year, month, day, hours, minutes, 0, 0);

  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

/** Readable label for the date-picker trigger. */
export function formatDatePickerDisplay(
  value: string,
  locale: "en" | "ar",
  includeTime: boolean,
): string {
  const date = parseDateInputValue(value);
  if (!date) return value;

  const localeTag = intlLocale(locale);
  const datePart = new Intl.DateTimeFormat(localeTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);

  if (!includeTime) return datePart;

  const timePart = new Intl.DateTimeFormat(localeTag, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${datePart} · ${timePart}`;
}

/** Earliest allowed instant when `disablePast` is on (start of today local). */
export function getDisablePastMinValue(mode: "date" | "datetime"): string {
  const today = startOfLocalDay();
  return mode === "datetime" ? toDatetimeLocalInputValue(today) : toDateInputValue(today);
}

/** Latest allowed instant when `disableFuture` is on (end of today for datetime). */
export function getDisableFutureMaxValue(mode: "date" | "datetime"): string {
  const now = new Date();
  if (mode === "date") return toDateInputValue(now);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0, 0);
  return toDatetimeLocalInputValue(endOfDay);
}

/** Resolve the effective min bound from props. */
export function resolveDatePickerMin(options: {
  mode: "date" | "datetime";
  min?: string;
  disablePast?: boolean;
}): string | undefined {
  const fromPast = options.disablePast ? getDisablePastMinValue(options.mode) : undefined;
  if (!options.min) return fromPast;
  if (!fromPast) return options.min;
  return options.min > fromPast ? options.min : fromPast;
}

/** Resolve the effective max bound from props. */
export function resolveDatePickerMax(options: {
  mode: "date" | "datetime";
  max?: string;
  disableFuture?: boolean;
}): string | undefined {
  const fromFuture = options.disableFuture ? getDisableFutureMaxValue(options.mode) : undefined;
  if (!options.max) return fromFuture;
  if (!fromFuture) return options.max;
  return options.max < fromFuture ? options.max : fromFuture;
}
