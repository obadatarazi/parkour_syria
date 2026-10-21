import {
  AlertTriangle,
  ClipboardList,
  FileText,
  Gift,
  Package,
  type LucideIcon,
  MessageSquareWarning,
  ShieldAlert,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";

import type { NotificationTypeValue } from "@/features/notifications/types/notifications.types";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { resolveStaticEnumLabel } from "@/shared/constants/static-enum-options";
import { enumLabel, enumValue, type EnumLabelValue } from "@/shared/lib/api/normalize-enum.utils";

type NotificationVisual = {
  icon: LucideIcon;
  /** Icon glyph color */
  iconClass: string;
  /** Soft tinted chip behind the icon */
  chipClass: string;
};

const NOTIFICATION_VISUALS: Record<NotificationTypeValue, NotificationVisual> = {
  ORDER: {
    icon: ClipboardList,
    iconClass: "text-sky-600",
    chipClass: "bg-sky-100 ring-1 ring-sky-200/80",
  },
  STOCK: {
    icon: Package,
    iconClass: "text-amber-600",
    chipClass: "bg-amber-100 ring-1 ring-amber-200/80",
  },
  RX: {
    icon: FileText,
    iconClass: "text-violet-600",
    chipClass: "bg-violet-100 ring-1 ring-violet-200/80",
  },
  CUSTOMER: {
    icon: Users,
    iconClass: "text-emerald-600",
    chipClass: "bg-emerald-100 ring-1 ring-emerald-200/80",
  },
  PAYMENT: {
    icon: Wallet,
    iconClass: "text-brand",
    chipClass: "bg-brand-muted ring-1 ring-brand/20",
  },
  PROMO: {
    icon: Sparkles,
    iconClass: "text-pink-600",
    chipClass: "bg-pink-100 ring-1 ring-pink-200/80",
  },
  REVIEW: {
    icon: Star,
    iconClass: "text-orange-500",
    chipClass: "bg-orange-100 ring-1 ring-orange-200/80",
  },
  LOYALTY: {
    icon: Gift,
    iconClass: "text-indigo-600",
    chipClass: "bg-indigo-100 ring-1 ring-indigo-200/80",
  },
  CUSTOM: {
    icon: MessageSquareWarning,
    iconClass: "text-slate-600",
    chipClass: "bg-slate-100 ring-1 ring-slate-200/80",
  },
  WARNING: {
    icon: AlertTriangle,
    iconClass: "text-amber-700",
    chipClass: "bg-amber-100 ring-1 ring-amber-300/80",
  },
  ERROR: {
    icon: ShieldAlert,
    iconClass: "text-red-600",
    chipClass: "bg-red-100 ring-1 ring-red-200/80",
  },
};

export function getNotificationVisual(
  typeValue: string | null | undefined,
): NotificationVisual {
  if (typeValue && typeValue in NOTIFICATION_VISUALS) {
    return NOTIFICATION_VISUALS[typeValue as NotificationTypeValue];
  }
  return NOTIFICATION_VISUALS.CUSTOM;
}

/** Combined chip classes for icon containers (backward-compatible helper). */
export function getNotificationVisualColorClass(
  typeValue: string | null | undefined,
): string {
  const visual = getNotificationVisual(typeValue);
  return `${visual.iconClass} ${visual.chipClass}`;
}

export function getNotificationUserLabel(user: {
  fullName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  id: number;
}): string {
  return user.fullName || user.phoneNumber || user.email || `#${user.id}`;
}

export function getNotificationTypeLabel(
  type: string | EnumLabelValue | null | undefined,
  language: "en" | "ar",
): string | null {
  return resolveStaticEnumLabel(
    "notificationType",
    enumValue(type),
    language,
    enumLabel(type),
  );
}

type NotificationCopySource = {
  title?: string | null;
  body?: string | null;
  translations?: {
    en?: { title?: string | null; body?: string | null };
    ar?: { title?: string | null; body?: string | null };
  };
};

const AMOUNT_TOKEN = "\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?|\\d+(?:\\.\\d+)?";

function parseAmountToken(raw: string): number | null {
  const value = Number(raw.replace(/,/g, ""));
  return Number.isFinite(value) ? value : null;
}

/** Fill missing guest names and normalize amounts to `13.00 KWD`. */
export function sanitizeNotificationBody(body: string, language: "en" | "ar"): string {
  const guest = language === "ar" ? "زائر" : "Guest";
  let next = body;

  next = next.replace(/placed by\s*[-–—]\s*/gi, `placed by ${guest} `);
  next = next.replace(/placed by\s+(?=with a total\b)/gi, `placed by ${guest} `);
  next = next.replace(/بواسطة\s*[-–—]\s*/g, `بواسطة ${guest} `);
  next = next.replace(/من قبل\s*[-–—]\s*/g, `من قبل ${guest} `);

  next = next.replace(new RegExp(`\\btotal of\\s+(${AMOUNT_TOKEN})\\b`, "gi"), (full, raw: string) => {
    const amount = parseAmountToken(raw);
    return amount == null ? full : `total of ${formatKwd(amount)}`;
  });
  next = next.replace(new RegExp(`بقيمة\\s+(${AMOUNT_TOKEN})(?!\\s*(?:د\\.ك|KWD))`, "g"), (full, raw: string) => {
    const amount = parseAmountToken(raw);
    return amount == null ? full : `بقيمة ${formatKwd(amount)}`;
  });

  next = next.replace(new RegExp(`\\bKWD\\s+(${AMOUNT_TOKEN})\\b`, "gi"), (full, raw: string) => {
    const amount = parseAmountToken(raw);
    return amount == null ? full : formatKwd(amount);
  });
  next = next.replace(new RegExp(`\\b(${AMOUNT_TOKEN})\\s+KWD\\b`, "gi"), (full, raw: string) => {
    const amount = parseAmountToken(raw);
    return amount == null ? full : formatKwd(amount);
  });

  return next.replace(/\s{2,}/g, " ").trim();
}

/** Inbox/bell copy for the active UI language. Prefers that locale's translation. */
export function getLocalizedNotificationCopy(
  notification: NotificationCopySource,
  language: "en" | "ar",
): { title: string; body: string | null } {
  const preferred = notification.translations?.[language];
  const other = notification.translations?.[language === "ar" ? "en" : "ar"];
  const title =
    preferred?.title?.trim() ||
    notification.title?.trim() ||
    other?.title?.trim() ||
    "";
  const rawBody =
    preferred?.body?.trim() ||
    notification.body?.trim() ||
    other?.body?.trim() ||
    null;

  return {
    title: title ? sanitizeNotificationBody(title, language) : title,
    body: rawBody ? sanitizeNotificationBody(rawBody, language) : null,
  };
}
