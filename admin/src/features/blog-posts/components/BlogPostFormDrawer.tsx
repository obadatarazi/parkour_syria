import { BlogPostForm } from "@/features/blog-posts/components/BlogPostForm";
import { useBlogPostMutations } from "@/features/blog-posts/hooks/use-blog-post-mutations";
import type { BlogPost } from "@/features/blog-posts/types/blog-posts.types";
import { CrudDirtyFormDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type BlogPostFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  post?: BlogPost | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function BlogPostFormDrawer({
  open,
  mode,
  post,
  onOpenChange,
  onSuccess,
}: BlogPostFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useBlogPostMutations({ onSuccess });

  return (
    <CrudDirtyFormDrawer
      open={open}
      mode={mode}
      title={mode === "create" ? t.addBlogPost : t.editBlogPost}
      size="full"
      isLoading={isSaving}
      onOpenChange={onOpenChange}
    >
      {({ onDirtyChange, requestClose, closeClean }) => (
        <BlogPostForm
          mode={mode}
          post={post}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={onDirtyChange}
          onSubmit={async (data) => {
            const result = await save(mode, data, post ?? undefined);
            if (result) closeClean();
          }}
        />
      )}
    </CrudDirtyFormDrawer>
  );
}
