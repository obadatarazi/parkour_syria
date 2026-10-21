import type { TagsService } from "@/features/tags/services/tags.service.types";
import { createApiTagsService } from "@/features/tags/services/tags-api.service";

export const tagsService: TagsService = createApiTagsService();
