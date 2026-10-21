import type { AttributesService } from "@/features/attributes/services/attributes.service.types";
import { createApiAttributesService } from "@/features/attributes/services/attributes-api.service";

export const attributesService: AttributesService = createApiAttributesService();
