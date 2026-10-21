import { Package } from "lucide-react";

import type { Brand } from "@/features/brands/types/brands.types";
import {
  AppButton,
  BilingualText,
  BrandImagePlaceholder,
  EntityMediaThumbnail,
  StatusBadge,
} from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  getBilingualDescription,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

type BrandViewDialogProps = {
  open: boolean;
  brand: Brand | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (brand: Brand) => void;
  onDelete?: (brand: Brand) => void;
  canViewProducts?: boolean;
  onViewProducts?: (brand: Brand) => void;
};

export function BrandViewDialog({
  open,
  brand,
  canUpdate = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onDelete,
  canViewProducts = false,
  onViewProducts,
}: BrandViewDialogProps) {
  const t = useTranslation();

  if (!brand) return null;

  const title = getBilingualTitle(brand.translations, brand.title);
  const description = getBilingualDescription(brand.translations, brand.description);

  const sections: CrudViewDialogSection[] = [
    {
      id: "content",
      title: t.brandContent,
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
      title: t.brandDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{brand.id}</CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={brand}
      onOpenChange={onOpenChange}
      title={t.viewBrand}
      cancelLabel={t.cancel}
      canUpdate={canUpdate}
      canDelete={canDelete}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      onEdit={onEdit}
      onDelete={onDelete}
      footerActions={
        canViewProducts && onViewProducts ? (
          <AppButton variant="outline" onClick={() => onViewProducts(brand)}>
            <Package className="size-4" aria-hidden="true" />
            {t.viewBrandProducts}
          </AppButton>
        ) : null
      }
      sections={sections}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <EntityMediaThumbnail
            imageUrl={brand.logoFileUrl}
            size="lg"
            placeholder={<BrandImagePlaceholder size="lg" />}
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
                label={brand.publish ? t.active : t.inactive}
                variant={brand.publish ? "success" : "neutral"}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
