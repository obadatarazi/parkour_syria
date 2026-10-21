import type { LessonsService } from "@/features/lessons/services/lessons.service.types";
import { createApiLessonsService } from "@/features/lessons/services/lessons-api.service";

export const lessonsService: LessonsService = createApiLessonsService();
