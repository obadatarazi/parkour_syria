import { BlogCategoryForm } from "@/features/blog-categories/components/BlogCategoryForm";
import { useBlogCategoryMutations } from "@/features/blog-categories/hooks/use-blog-category-mutations";
import type { BlogCategory } from "@/features/blog-categories/types/blog-categories.types";
import { CrudDirtyFormDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type BlogCategoryFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  blogCategory?: BlogCategory | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function BlogCategoryFormDrawer({ open, mode, blogCategory, onOpenChange, onSuccess }: BlogCategoryFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useBlogCategoryMutations({ onSuccess });

  return (
    <CrudDirtyFormDrawer
      open={open}
      mode={mode}
      title={mode === "create" ? t.addBlogCategory : t.editBlogCategory}
      size="md"
      isLoading={isSaving}
      onOpenChange={onOpenChange}
    >
      {({ onDirtyChange, requestClose, closeClean }) => (
        <BlogCategoryForm
          mode={mode}
          blogCategory={blogCategory}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={onDirtyChange}
          onSubmit={async (data) => {
            const result = await save(mode, data, blogCategory ?? undefined);
            if (result) closeClean();
          }}
        />
      )}
    </CrudDirtyFormDrawer>
  );
}
