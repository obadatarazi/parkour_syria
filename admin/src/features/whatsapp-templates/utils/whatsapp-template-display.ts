import type { WhatsAppTemplateStatusValue } from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import { WHATSAPP_TEMPLATE_STATUSES } from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import type { StatusBadgeVariant } from "@/shared/components";
import type { Translation } from "@/shared/design-system/localization/locales/en";

const PHONE_PATTERN = /^[0-9+\-\s()]+$/;

export function whatsAppTemplateStatusVariant(value: string): StatusBadgeVariant {
  switch (value) {
    case "ENABLED":
      return "success";
    case "PENDING":
    case "UNKNOWN":
      return "info";
    case "REJECTED":
    case "MISSING_ON_META":
      return "danger";
    case "CHANNEL_DISABLED":
    case "NOT_CONFIGURED":
      return "warning";
    default:
      return "neutral";
  }
}

export function whatsAppTemplateStatusFilterLabel(
  value: WhatsAppTemplateStatusValue,
  t: Translation,
): string {
  switch (value) {
    case "ENABLED":
      return t.whatsappStatusEnabled;
    case "DISABLED_BY_ADMIN":
      return t.whatsappStatusDisabledByAdmin;
    case "CHANNEL_DISABLED":
      return t.whatsappStatusChannelDisabled;
    case "NOT_CONFIGURED":
      return t.whatsappStatusNotConfigured;
    case "MISSING_ON_META":
      return t.whatsappStatusMissingOnMeta;
    case "PENDING":
      return t.whatsappStatusPending;
    case "REJECTED":
      return t.whatsappStatusRejected;
    case "UNKNOWN":
      return t.whatsappStatusUnknown;
  }
}

/** Prefer Admin locale strings; fall back to the API label for unknown values. */
export function resolveWhatsAppTemplateStatusLabel(
  value: string,
  fallback: string,
  t: Translation,
): string {
  if ((WHATSAPP_TEMPLATE_STATUSES as readonly string[]).includes(value)) {
    return whatsAppTemplateStatusFilterLabel(value as WhatsAppTemplateStatusValue, t);
  }
  return fallback || value;
}

export function isWhatsAppTestPhone(value: string): boolean {
  const phone = value.trim();
  return phone.length > 0 && phone.length <= 20 && PHONE_PATTERN.test(phone);
}

/** Empty fields fall back to the sample on the server, so they are omitted. */
export function compactWhatsAppParameters(
  values: Record<string, string>,
): Record<string, string> | undefined {
  const entries = Object.entries(values).filter(([, value]) => value.trim() !== "");
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries.map(([key, value]) => [key, value.trim()]));
}
