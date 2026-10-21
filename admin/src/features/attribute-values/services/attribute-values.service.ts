import type { AttributeValuesService } from "@/features/attribute-values/services/attribute-values.service.types";
import { createApiAttributeValuesService } from "@/features/attribute-values/services/attribute-values-api.service";

export const attributeValuesService: AttributeValuesService = createApiAttributeValuesService();
