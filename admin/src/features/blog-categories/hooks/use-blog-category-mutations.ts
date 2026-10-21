import { blogCategoriesService } from "@/features/blog-categories/services/blog-categories.service";
import { blogCategoryToFormData, pickBlogCategoryFormChanges } from "@/features/blog-categories/types/blog-categories.types";
import { useEntityCrudMutations } from "@/shared/crud";

export function useBlogCategoryMutations({ onSuccess }: { onSuccess?: () => void | Promise<void> } = {}) {
  return useEntityCrudMutations({
    service: blogCategoriesService,
    toFormData: blogCategoryToFormData,
    pickChanges: pickBlogCategoryFormChanges,
    onSuccess,
  });
}
