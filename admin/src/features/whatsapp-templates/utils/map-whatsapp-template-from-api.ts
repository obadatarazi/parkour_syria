import type {
  WhatsAppTemplate,
  WhatsAppTemplateCatalog,
  WhatsAppTemplatePreview,
  WhatsAppTemplatePreviewButton,
  WhatsAppTemplatePreviewParameter,
  WhatsAppTemplateTestResult,
} from "@/features/whatsapp-templates/types/whatsapp-templates.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

export function mapWhatsAppTemplatePreviewFromApi(value: unknown): WhatsAppTemplatePreview {
  const record = asRecord(value);
  const header = asRecord(record?.header);
  const parameters = Array.isArray(record?.parameters) ? record.parameters : [];
  const buttons = Array.isArray(record?.buttons) ? record.buttons : [];
  const warnings = Array.isArray(record?.warnings) ? record.warnings : [];

  return {
    available: asBoolean(record?.available),
    templateName: asString(record?.templateName),
    language: asString(record?.language),
    category: asString(record?.category),
    header: header
      ? {
          format: asString(header.format) ?? "TEXT",
          text: asString(header.text),
        }
      : null,
    body: asString(record?.body),
    footer: asString(record?.footer),
    buttons: buttons.map((button): WhatsAppTemplatePreviewButton => {
      const item = asRecord(button);
      return {
        type: asString(item?.type) ?? "",
        text: asString(item?.text) ?? "",
        url: asString(item?.url),
      };
    }),
    parameters: parameters.map((parameter, position): WhatsAppTemplatePreviewParameter => {
      const item = asRecord(parameter);
      return {
        index: asNumber(item?.index) ?? position + 1,
        key: asString(item?.key) ?? "",
        label: asString(item?.label) ?? "",
        value: asString(item?.value) ?? "",
        sample: asString(item?.sample) ?? "",
        isCustom: asBoolean(item?.isCustom),
      };
    }),
    warnings: warnings.flatMap((warning) => {
      const text = asString(warning);
      return text ? [text] : [];
    }),
  };
}

export function mapWhatsAppTemplateCatalogFromApi(value: unknown): WhatsAppTemplateCatalog {
  const record = asRecord(value);
  return {
    ok: asBoolean(record?.ok),
    stale: asBoolean(record?.stale),
    syncedAt: asString(record?.syncedAt),
    error: asString(record?.error),
  };
}

export function mapWhatsAppTemplateFromApi(value: unknown): WhatsAppTemplate {
  const record = asRecord(value);
  const status = asRecord(record?.status);
  const placeholders = asRecord(record?.placeholders);
  const updatedBy = asRecord(record?.updatedBy);
  const event = asString(record?.event) ?? "";

  return {
    id: event,
    event,
    label: asString(record?.label) ?? event,
    description: asString(record?.description) ?? "",
    templateName: asString(record?.templateName),
    language: asString(record?.language),
    category: asString(record?.category),
    isEnabled: asBoolean(record?.isEnabled, true),
    isCritical: asBoolean(record?.isCritical),
    status: {
      value: asString(status?.value) ?? "UNKNOWN",
      label: asString(status?.label) ?? "",
      isDelivering: asBoolean(status?.isDelivering),
    },
    metaStatus: asString(record?.metaStatus),
    placeholders: {
      declaredOnMeta: asNumber(placeholders?.declaredOnMeta),
      sentByApp: asNumber(placeholders?.sentByApp) ?? 0,
    },
    note: asString(record?.note),
    updatedBy: updatedBy
      ? {
          id: asNumber(updatedBy.id) ?? 0,
          fullName: asString(updatedBy.fullName) ?? "",
        }
      : null,
    updatedAt: asString(record?.updatedAt),
    preview: mapWhatsAppTemplatePreviewFromApi(record?.preview),
    catalog: mapWhatsAppTemplateCatalogFromApi(record?.catalog),
  };
}

export function mapWhatsAppTemplateTestResultFromApi(value: unknown): WhatsAppTemplateTestResult {
  const record = asRecord(value);
  return {
    ok: asBoolean(record?.ok),
    messageId: asString(record?.messageId),
    error: asString(record?.error),
    code: asString(record?.code),
    rendered: mapWhatsAppTemplatePreviewFromApi(record?.rendered),
  };
}

export function unwrapWhatsAppTemplateList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  if (Array.isArray(record?.data)) return record.data;
  return [];
}
