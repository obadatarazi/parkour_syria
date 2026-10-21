import { blogPostsService } from "@/features/blog-posts/services/blog-posts.service";
import {
  blogPostToFormData,
  pickBlogPostFormChanges,
} from "@/features/blog-posts/types/blog-posts.types";
import { useEntityCrudMutations } from "@/shared/crud";

export function useBlogPostMutations({
  onSuccess,
}: { onSuccess?: () => void | Promise<void> } = {}) {
  return useEntityCrudMutations({
    service: blogPostsService,
    toFormData: blogPostToFormData,
    pickChanges: pickBlogPostFormChanges,
    onSuccess,
  });
}
