import type {
  WhatsAppTemplate,
  WhatsAppTemplateFormData,
  WhatsAppTemplateListParams,
  WhatsAppTemplateListResult,
  WhatsAppTemplatePreview,
  WhatsAppTemplateTestResult,
} from "@/features/whatsapp-templates/types/whatsapp-templates.types";

export interface WhatsAppTemplatesService {
  list(
    params?: WhatsAppTemplateListParams,
    signal?: AbortSignal,
  ): Promise<WhatsAppTemplateListResult>;
  getByEvent(event: string, signal?: AbortSignal): Promise<WhatsAppTemplate>;
  update(event: string, data: WhatsAppTemplateFormData): Promise<WhatsAppTemplate>;
  preview(
    event: string,
    parameters?: Record<string, string>,
  ): Promise<WhatsAppTemplatePreview>;
  sync(): Promise<WhatsAppTemplateListResult>;
  sendTest(
    event: string,
    phone: string,
    parameters?: Record<string, string>,
  ): Promise<WhatsAppTemplateTestResult>;
}
