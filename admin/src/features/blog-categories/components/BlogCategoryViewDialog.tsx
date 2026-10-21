import type { BlogCategory } from "@/features/blog-categories/types/blog-categories.types";
import { StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudLocaleFieldsView, CrudViewDialog } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

type BlogCategoryViewDialogProps = {
  open: boolean;
  blogCategory: BlogCategory | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (blogCategory: BlogCategory) => void;
  onDelete?: (blogCategory: BlogCategory) => void;
};

export function BlogCategoryViewDialog({ blogCategory, ...props }: BlogCategoryViewDialogProps) {
  const t = useTranslation();
  if (!blogCategory) return null;

  return (
    <CrudViewDialog
      {...props}
      entity={blogCategory}
      title={t.viewBlogCategory}
      cancelLabel={t.cancel}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      hero={
        <div className="space-y-3">
          <p className="text-lg font-semibold text-foreground">
            {pickLocaleText(blogCategory.translations, "title", blogCategory.title)}
          </p>
          <StatusBadge
            label={blogCategory.publish ? t.publishedLabel : t.draftLabel}
            variant={blogCategory.publish ? "success" : "neutral"}
          />
        </div>
      }
      sections={[
        {
          id: "content",
          title: t.sectionContent,
          content: (
            <CrudLocaleFieldsView
              translations={blogCategory.translations}
              fields={[{ key: "title", label: t.fieldTitle }]}
            />
          ),
        },
        {
          id: "details",
          title: t.sectionDetails,
          content: (
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.slug}>
                <span dir="ltr" className="font-mono text-sm">{blogCategory.slug}</span>
              </CrudDetailField>
              <CrudDetailField label={t.sortOrder}>{blogCategory.sortOrder}</CrudDetailField>
            </div>
          ),
        },
      ]}
    />
  );
}
