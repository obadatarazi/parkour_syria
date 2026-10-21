import type { PaginatedResult } from "@/shared/types";

export const WHATSAPP_TEMPLATE_STATUSES = [
  "ENABLED",
  "DISABLED_BY_ADMIN",
  "CHANNEL_DISABLED",
  "NOT_CONFIGURED",
  "MISSING_ON_META",
  "PENDING",
  "REJECTED",
  "UNKNOWN",
] as const;

export type WhatsAppTemplateStatusValue = (typeof WHATSAPP_TEMPLATE_STATUSES)[number];

export type WhatsAppTemplatePreviewParameter = {
  index: number;
  key: string;
  label: string;
  value: string;
  sample: string;
  isCustom: boolean;
};

export type WhatsAppTemplatePreviewButton = {
  type: string;
  text: string;
  url: string | null;
};

export type WhatsAppTemplatePreview = {
  available: boolean;
  templateName: string | null;
  language: string | null;
  category: string | null;
  header: { format: string; text: string | null } | null;
  body: string | null;
  footer: string | null;
  buttons: WhatsAppTemplatePreviewButton[];
  parameters: WhatsAppTemplatePreviewParameter[];
  warnings: string[];
};

export type WhatsAppTemplateCatalog = {
  ok: boolean;
  stale: boolean;
  syncedAt: string | null;
  error: string | null;
};

export type WhatsAppTemplate = {
  /** Same as `event`. CRUD row actions key off `id`. */
  id: string;
  event: string;
  label: string;
  description: string;
  templateName: string | null;
  language: string | null;
  category: string | null;
  isEnabled: boolean;
  isCritical: boolean;
  status: {
    value: WhatsAppTemplateStatusValue | string;
    label: string;
    isDelivering: boolean;
  };
  metaStatus: string | null;
  placeholders: {
    declaredOnMeta: number | null;
    sentByApp: number;
  };
  note: string | null;
  updatedBy: { id: number; fullName: string } | null;
  updatedAt: string | null;
  preview: WhatsAppTemplatePreview;
  catalog: WhatsAppTemplateCatalog;
};

export type WhatsAppTemplateListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isEnabled?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type WhatsAppTemplateFormData = {
  isEnabled: boolean;
  note: string;
};

export type WhatsAppTemplateListResult = PaginatedResult<WhatsAppTemplate> & {
  catalog: WhatsAppTemplateCatalog | null;
};

export type WhatsAppTemplateTestResult = {
  ok: boolean;
  messageId: string | null;
  error: string | null;
  code: string | null;
  rendered: WhatsAppTemplatePreview;
};

export function whatsAppTemplateToFormData(entity: WhatsAppTemplate): WhatsAppTemplateFormData {
  return {
    isEnabled: entity.isEnabled,
    note: entity.note ?? "",
  };
}

export function hasWhatsAppTemplateFormChanges(
  original: WhatsAppTemplateFormData,
  current: WhatsAppTemplateFormData,
): boolean {
  return (
    original.isEnabled !== current.isEnabled || original.note.trim() !== current.note.trim()
  );
}

/** Silencing a payment message needs MANAGE. Turning one back on does not. */
export function canDisableWhatsAppTemplate(
  entity: Pick<WhatsAppTemplate, "isCritical">,
  canManage: boolean,
): boolean {
  return !entity.isCritical || canManage;
}
