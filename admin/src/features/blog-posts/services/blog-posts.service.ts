import type { BlogPostsService } from "@/features/blog-posts/services/blog-posts.service.types";
import { createApiBlogPostsService } from "@/features/blog-posts/services/blog-posts-api.service";

export const blogPostsService: BlogPostsService = createApiBlogPostsService();
