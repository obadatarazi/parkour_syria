import type { Category } from "@/features/categories/types/categories.types";
import { useCategoryPathIndex } from "@/features/categories/hooks/use-category-path-index";
import { getCategoryDepthLabel } from "@/features/categories/utils/category-display.utils";
import { categoryAllowsMerchandisingFlags } from "@/features/categories/utils/category-tree.utils";
import {
  BilingualText,
  CategoryImagePlaceholder,
  EntityMediaThumbnail,
  StatusBadge,
} from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  getBilingualDescription,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

type CategoryViewDialogProps = {
  open: boolean;
  category: Category | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
};

export function CategoryViewDialog({
  open,
  category,
  canUpdate = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onDelete,
}: CategoryViewDialogProps) {
  const t = useTranslation();
  const { getBreadcrumbPaths } = useCategoryPathIndex(open);

  if (!category) return null;

  const title = getBilingualTitle(category.translations, category.title);
  const description = getBilingualDescription(category.translations, category.description);
  const depthLabel =
    category.depth != null ? getCategoryDepthLabel(category.depth, t) : t.notSet;
  const allowsMerchandising = categoryAllowsMerchandisingFlags(category);

  const sections: CrudViewDialogSection[] = [
    {
      id: "content",
      title: t.categoryContent,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.titleEnglish}>
            {title.en || <span className="text-muted-foreground">{t.notSet}</span>}
          </CrudDetailField>
          <CrudDetailField label={t.titleArabic}>
            {title.ar ? (
              <span dir="rtl" className="block">
                {title.ar}
              </span>
            ) : (
              <span className="text-muted-foreground">{t.notSet}</span>
            )}
          </CrudDetailField>
          <CrudDetailField label={t.descriptionEnglish}>
            {description.en || <span className="text-muted-foreground">{t.notSet}</span>}
          </CrudDetailField>
          <CrudDetailField label={t.descriptionArabic}>
            {description.ar ? (
              <span dir="rtl" className="block">
                {description.ar}
              </span>
            ) : (
              <span className="text-muted-foreground">{t.notSet}</span>
            )}
          </CrudDetailField>
        </div>
      ),
    },
    {
      id: "details",
      title: t.categoryDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{category.id}</CrudDetailField>
          <CrudDetailField label={t.slug}>
            {category.slug || <span className="text-muted-foreground">{t.notSet}</span>}
          </CrudDetailField>
          <CrudDetailField label={t.depth}>{depthLabel}</CrudDetailField>
          <CrudDetailField label={t.parentCategories}>
            {(() => {
              const paths = getBreadcrumbPaths(category);

              if (!paths.length || (paths.length === 1 && paths[0] === category.title)) {
                return <span className="text-muted-foreground">{t.noParentCategories}</span>;
              }

              return (
                <div className="space-y-1">
                  {paths.map((path) => (
                    <p key={path}>{path}</p>
                  ))}
                </div>
              );
            })()}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={category}
      onOpenChange={onOpenChange}
      title={t.viewCategory}
      cancelLabel={t.cancel}
      canUpdate={canUpdate}
      canDelete={canDelete}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      onEdit={onEdit}
      onDelete={onDelete}
      sections={sections}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <EntityMediaThumbnail
            imageUrl={category.featureImageFileUrl}
            size="lg"
            placeholder={<CategoryImagePlaceholder size="lg" />}
          />

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <BilingualText values={title} titleClassName="text-lg font-semibold" />
              {description.en || description.ar ? (
                <div className="mt-2 text-sm text-muted-foreground">
                  <BilingualText values={description} titleClassName="font-normal" />
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={category.publish ? t.active : t.inactive}
                variant={category.publish ? "success" : "neutral"}
              />
              <StatusBadge
                label={category.showMenu ? t.showMenu : `${t.showMenu} (${t.inactive})`}
                variant={category.showMenu ? "success" : "neutral"}
              />
              {allowsMerchandising ? (
                <>
                  <StatusBadge
                    label={
                      category.showInHomePage
                        ? t.showInHomePage
                        : `${t.showInHomePage} (${t.inactive})`
                    }
                    variant={category.showInHomePage ? "success" : "neutral"}
                  />
                  <StatusBadge
                    label={category.feature ? t.featured : `${t.featured} (${t.inactive})`}
                    variant={category.feature ? "success" : "neutral"}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      }
    />
  );
}
