import type {
  Lesson,
  LessonFormData,
  LessonListParams,
  LessonListResult,
} from "@/features/lessons/types/lessons.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface LessonsService {
  list(params?: LessonListParams, signal?: AbortSignal): Promise<LessonListResult>;
  getById(id: number): Promise<Lesson>;
  create(data: LessonFormData): Promise<Lesson>;
  update(id: number, data: Partial<LessonFormData>): Promise<Lesson>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
