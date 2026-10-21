import { lessonsService } from "@/features/lessons/services/lessons.service";
import { lessonToFormData, pickLessonFormChanges } from "@/features/lessons/types/lessons.types";
import { useEntityCrudMutations } from "@/shared/crud";

export function useLessonMutations({ onSuccess }: { onSuccess?: () => void | Promise<void> } = {}) {
  return useEntityCrudMutations({
    service: lessonsService,
    toFormData: lessonToFormData,
    pickChanges: pickLessonFormChanges,
    onSuccess,
  });
}
