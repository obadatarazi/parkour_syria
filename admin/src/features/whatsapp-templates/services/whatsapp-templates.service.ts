import type { WhatsAppTemplatesService } from "@/features/whatsapp-templates/services/whatsapp-templates.service.types";
import { createApiWhatsAppTemplatesService } from "@/features/whatsapp-templates/services/whatsapp-templates-api.service";

export const whatsappTemplatesService: WhatsAppTemplatesService = createApiWhatsAppTemplatesService();
