import {
  FileText,
  Images,
  LayoutGrid,
  MessageSquare,
  Pencil,
  Search,
  SlidersHorizontal,
  Star,
  Tags,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { productEditPath, ROUTES } from "@/app/router/routes";
import { useProductReviewsPreview } from "@/features/product-reviews/hooks/use-product-reviews-preview";
import { getReviewCustomerLabel } from "@/features/product-reviews/types/product-reviews.types";
import { ProductStorefrontUrlCopyButton, ProductStorefrontUrlDisplay } from "@/features/products/components/ProductStorefrontUrlCopyButton";
import { ProductVariantListTable } from "@/features/products/components/ProductVariantListTable";
import { ProductVisibilityBadges } from "@/features/products/components/ProductVisibilityBadges";
import type { ProductQuickToggleField } from "@/features/products/hooks/use-product-mutations";
import type { Product } from "@/features/products/types/products.types";
import { getProductBilingualSlugs } from "@/features/products/types/products.types";
import {
  formatKwd,
  formatProductPriceLabel,
  formatProductStockRangeLabel,
  getFeaturedProductImage,
  getProductTotalStock,
  joinRelationTitles,
} from "@/features/products/utils/product-display.utils";
import type { ProductCompletenessItem } from "@/features/products/utils/product-form-completeness";
import { scoreSeoOverall } from "@/features/products/utils/seo-score.utils";
import {
  getAttributeItemLabel,
  getVariantDisplayLabel,
  normalizeProductType,
} from "@/features/products/utils/variant-attribute.utils";
import {
  AppButton,
  BilingualText,
  MediaImage,
  StatusBadge,
  ToggleField,
} from "@/shared/components";
import { CrudDetailField, CrudRecordSection, CrudRecordWorkspace } from "@/shared/crud";
import { Skeleton } from "@/shared/design-system/components/ui/skeleton";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  getBilingualDescription,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

type ProductViewSectionId =
  | "general"
  | "content"
  | "media"
  | "attributes"
  | "variants"
  | "seo"
  | "reviews";

type ProductViewWorkspaceProps = {
  product: Product;
  canUpdate: boolean;
  canDelete: boolean;
  onBack: () => void;
  onDelete: () => void;
  onToggle: (field: ProductQuickToggleField, value: boolean) => void;
  isToggleLoading: (field: ProductQuickToggleField) => boolean;
};

function EmptyValue({ label }: { label: string }) {
  return <span className="text-muted-foreground">{label}</span>;
}

function TextOrEmpty({
  value,
  emptyLabel,
  rtl = false,
  mono = false,
}: {
  value?: string | null;
  emptyLabel: string;
  rtl?: boolean;
  mono?: boolean;
}) {
  const trimmed = value?.trim();
  if (!trimmed) return <EmptyValue label={emptyLabel} />;
  return (
    <span dir={rtl ? "rtl" : undefined} className={cn("block", mono && "font-mono text-sm")}>
      {trimmed}
    </span>
  );
}

export function ProductViewWorkspace({
  product,
  canUpdate,
  canDelete,
  onBack,
  onDelete,
  onToggle,
  isToggleLoading,
}: ProductViewWorkspaceProps) {
  const t = useTranslation();
  const [activeSection, setActiveSection] = useState<ProductViewSectionId>("general");
  const {
    reviews,
    totalReviews,
    isLoading: isReviewsLoading,
  } = useProductReviewsPreview({
    productId: product.id,
    enabled: true,
  });

  const title = getBilingualTitle(product.translations, product.title);
  const slugs = getProductBilingualSlugs(product);
  const description = getBilingualDescription(product.translations, product.description);
  const featuredImage = getFeaturedProductImage(product.images);
  const productType = normalizeProductType(product.type);
  const totalStock = getProductTotalStock(product);
  const stockDisplay =
    productType === "VARIABLE_PRODUCT"
      ? formatProductStockRangeLabel(product, String(totalStock))
      : String(totalStock);
  const liveTitle = title.en?.trim() || title.ar?.trim() || t.viewProduct;
  const seo = scoreSeoOverall(
    product.translations?.en?.metaTitle || product.metaTitle || "",
    product.translations?.en?.metaDescription || product.metaDescription || "",
  );
  const seoToneClass =
    seo.tone === "good" ? "bg-emerald-500" : seo.tone === "ok" ? "bg-amber-500" : "bg-rose-400";
  const completeness: ProductCompletenessItem[] = [
    {
      id: "title",
      section: "content",
      done: Boolean(title.en?.trim() || title.ar?.trim()),
    },
    { id: "brand", section: "general", done: Boolean(product.brand?.id) },
    {
      id: "categories",
      section: "general",
      done: (product.categories?.length ?? 0) > 0,
    },
    {
      id: "media",
      section: "media",
      done: (product.images?.length ?? 0) > 0,
    },
    {
      id: "pricing",
      section: productType === "VARIABLE_PRODUCT" ? "variants" : "attributes",
      done:
        productType === "VARIABLE_PRODUCT"
          ? (product.variants?.length ?? 0) > 0
          : Boolean(product.skuCode?.trim()) && product.price != null && product.stock != null,
    },
    {
      id: "seo",
      section: "seo",
      done: Boolean(
        product.translations?.en?.metaTitle?.trim() ||
          product.metaTitle?.trim() ||
          product.translations?.en?.metaDescription?.trim() ||
          product.metaDescription?.trim(),
      ),
    },
  ];
  const completenessDone = completeness.filter((item) => item.done).length;
  const completenessProgress = Math.round((completenessDone / completeness.length) * 100);
  const completenessLabels: Record<string, string> = {
    title: t.titleEnglish,
    brand: t.brand,
    categories: t.categoriesCol,
    media: t.productTabMedia,
    pricing: productType === "VARIABLE_PRODUCT" ? t.productTabVariants : t.price,
    seo: t.productTabSeo,
  };
  const reviewsHref = `${ROUTES.admin.productReviews}?search=${encodeURIComponent(
    title.en?.trim() || title.ar?.trim() || String(product.id),
  )}`;

  const sectionItems: {
    id: ProductViewSectionId;
    label: string;
    icon: typeof LayoutGrid;
  }[] = [
    { id: "general", label: t.productTabGeneral, icon: LayoutGrid },
    { id: "content", label: t.productTabContent, icon: FileText },
    { id: "media", label: t.productTabMedia, icon: Images },
    { id: "attributes", label: t.productTabAttributes, icon: Tags },
    ...(productType === "VARIABLE_PRODUCT"
      ? [{ id: "variants" as const, label: t.productTabVariants, icon: SlidersHorizontal }]
      : []),
    { id: "seo", label: t.productTabSeo, icon: Search },
    { id: "reviews", label: t.productTabReviews, icon: MessageSquare },
  ];

  return (
    <CrudRecordWorkspace
      breadcrumbHref={ROUTES.admin.products}
      breadcrumbLabel={t.products2}
      title={liveTitle}
      subtitle={t.productViewHint}
      meta={
        <>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {t.idLabel}: {product.id}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              product.publish
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-muted text-muted-foreground",
            )}
          >
            {product.publish ? t.publish : t.draft}
          </span>
        </>
      }
      onBack={onBack}
      backLabel={t.backToProducts}
      headerActions={
        <>
          <ProductStorefrontUrlCopyButton product={product} />
          {canDelete ? (
            <AppButton type="button" variant="outline" onClick={onDelete}>
              <Trash2 className="size-4" aria-hidden="true" />
              {t.deleteAction}
            </AppButton>
          ) : null}
          {canUpdate ? (
            <AppButton type="button" asChild>
              <Link to={productEditPath(product)}>
                <Pencil className="size-4" aria-hidden="true" />
                {t.editAction}
              </Link>
            </AppButton>
          ) : null}
        </>
      }
      sections={sectionItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      sectionsAriaLabel={t.productFormSections}
      aside={
        <aside className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t.productPreview}
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                product.publish
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {product.publish ? t.publish : t.draft}
            </span>
          </div>
          <ProductVisibilityBadges product={product} compact />
          <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
            {featuredImage ? (
              <MediaImage src={featuredImage} alt="" className="aspect-square max-h-52 w-full object-cover" />
            ) : (
              <div className="flex aspect-square items-center justify-center text-4xl" aria-hidden="true">
                📦
              </div>
            )}
          </div>
          <div className="space-y-1">
            <BilingualText values={title} titleClassName="text-sm font-semibold" />
            <p className="text-xs text-muted-foreground">{product.brand?.title || t.notSet}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={productType === "SIMPLE" ? t.productTypeSimple : t.productTypeVariant}
              variant="neutral"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 text-xs">
            <div>
              <p className="text-muted-foreground">{t.price}</p>
              <p className="mt-0.5 font-semibold text-foreground">{formatProductPriceLabel(product)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t.stock}</p>
              <p className="mt-0.5 font-semibold text-foreground">{stockDisplay}</p>
            </div>
          </div>
          <div className="space-y-2 rounded-xl bg-muted/40 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{t.productCompleteness}</span>
              <span className="tabular-nums text-muted-foreground">
                {completenessDone}/{completeness.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  completenessProgress === 100 ? "bg-emerald-500" : "bg-brand",
                )}
                style={{ width: `${completenessProgress}%` }}
              />
            </div>
            <ul className="space-y-1.5 pt-1">
              {completeness.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActiveSection(item.section)}
                    className="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-start text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        item.done ? "bg-emerald-500" : "bg-border",
                      )}
                      aria-hidden="true"
                    />
                    <span className={item.done ? "text-foreground" : undefined}>
                      {completenessLabels[item.id] ?? item.id}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">{t.productSeoScoreLabel}</p>
            <span
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-full text-xs font-bold text-white tabular-nums",
                seoToneClass,
              )}
            >
              {seo.score}
            </span>
          </div>
        </aside>
      }
    >
      {activeSection === "general" ? (
        <div className="space-y-5">
          <CrudRecordSection title={t.productTabGeneral} as="h2">
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.brand}>
                {product.brand?.title ?? <EmptyValue label={t.notSet} />}
              </CrudDetailField>
              <CrudDetailField label={t.productType}>
                {productType === "SIMPLE" ? t.productTypeSimple : t.productTypeVariant}
              </CrudDetailField>
              <CrudDetailField label={t.categoriesCol}>
                {joinRelationTitles(product.categories ?? []) || <EmptyValue label={t.notSet} />}
              </CrudDetailField>
              <CrudDetailField label={t.tags}>
                {joinRelationTitles(product.tags ?? []) || <EmptyValue label={t.notSet} />}
              </CrudDetailField>
              <CrudDetailField label={t.skuCode}>
                <TextOrEmpty value={product.skuCode} emptyLabel={t.notSet} />
              </CrudDetailField>
              <CrudDetailField label={t.eanCode}>
                <TextOrEmpty value={product.eanCode} emptyLabel={t.notSet} />
              </CrudDetailField>
              <CrudDetailField label={t.stock}>{stockDisplay}</CrudDetailField>
              <CrudDetailField label={t.status}>
                {product.status?.label ?? <EmptyValue label={t.notSet} />}
              </CrudDetailField>
              <CrudDetailField label={t.averageRating}>
                {product.averageRating != null ? (
                  <span className="inline-flex items-center gap-1 text-amber-600">
                    <Star className="size-3.5 fill-current" aria-hidden="true" />
                    {product.averageRating}
                  </span>
                ) : (
                  <EmptyValue label={t.notSet} />
                )}
              </CrudDetailField>
              <CrudDetailField label={t.price}>{formatProductPriceLabel(product)}</CrudDetailField>
              <CrudDetailField label={t.expiryStartDate}>
                <TextOrEmpty value={product.expiryStartDate} emptyLabel={t.notSet} />
              </CrudDetailField>
              <CrudDetailField label={t.expiryEndDate}>
                <TextOrEmpty value={product.expiryEndDate} emptyLabel={t.notSet} />
              </CrudDetailField>
              <div className="sm:col-span-2">
                <CrudDetailField label={t.productStorefrontUrl}>
                  <ProductStorefrontUrlDisplay product={product} />
                </CrudDetailField>
              </div>
            </div>
          </CrudRecordSection>

          <ProductVariantListTable product={product} />

          <CrudRecordSection title={t.productVisibility} as="h2">
            <div className="space-y-3">
              <ToggleField
                label={t.publish}
                checked={product.publish ?? false}
                disabled={!canUpdate || isToggleLoading("publish")}
                onCheckedChange={(checked) => onToggle("publish", checked)}
              />
              <ToggleField
                label={t.featured}
                checked={product.featured ?? false}
                disabled={!canUpdate || isToggleLoading("featured")}
                onCheckedChange={(checked) => onToggle("featured", checked)}
              />
              <ToggleField
                label={t.bestSeller}
                checked={product.bestSeller ?? false}
                disabled={!canUpdate || isToggleLoading("bestSeller")}
                onCheckedChange={(checked) => onToggle("bestSeller", checked)}
              />
              <ToggleField
                label={t.newlyArrived}
                checked={product.newlyArrived ?? false}
                disabled={!canUpdate || isToggleLoading("newlyArrived")}
                onCheckedChange={(checked) => onToggle("newlyArrived", checked)}
              />
              <ToggleField
                label={t.isProductYouWillLove}
                checked={product.isProductYouWillLove ?? false}
                disabled={!canUpdate || isToggleLoading("isProductYouWillLove")}
                onCheckedChange={(checked) => onToggle("isProductYouWillLove", checked)}
              />
            </div>
          </CrudRecordSection>
        </div>
      ) : null}

      {activeSection === "content" ? (
        <CrudRecordSection title={t.productTabContent} as="h2">
          <div className="grid gap-4 sm:grid-cols-2">
            <CrudDetailField label={t.titleEnglish}>
              <TextOrEmpty value={title.en} emptyLabel={t.notSet} />
            </CrudDetailField>
            <CrudDetailField label={t.titleArabic}>
              <TextOrEmpty value={title.ar} emptyLabel={t.notSet} rtl />
            </CrudDetailField>
            <CrudDetailField label={`${t.slug} (${t.tabEnglish})`}>
              <TextOrEmpty value={slugs.en} emptyLabel={t.notSet} mono />
            </CrudDetailField>
            <CrudDetailField label={`${t.slug} (${t.tabArabic})`}>
              <TextOrEmpty value={slugs.ar} emptyLabel={t.notSet} mono />
            </CrudDetailField>
            <CrudDetailField label={t.descriptionEnglish}>
              <TextOrEmpty value={description.en} emptyLabel={t.notSet} />
            </CrudDetailField>
            <CrudDetailField label={t.descriptionArabic}>
              <TextOrEmpty value={description.ar} emptyLabel={t.notSet} rtl />
            </CrudDetailField>
            <CrudDetailField label={t.benefits}>
              <TextOrEmpty
                value={product.translations?.en?.benefits || product.benefits}
                emptyLabel={t.notSet}
              />
            </CrudDetailField>
            <CrudDetailField label={t.ingredients}>
              <TextOrEmpty
                value={product.translations?.en?.ingredients || product.ingredients}
                emptyLabel={t.notSet}
              />
            </CrudDetailField>
            <CrudDetailField label={t.usageMethod}>
              <TextOrEmpty
                value={product.translations?.en?.usageMethod || product.usageMethod}
                emptyLabel={t.notSet}
              />
            </CrudDetailField>
            <CrudDetailField label={t.warnings}>
              <TextOrEmpty
                value={product.translations?.en?.warnings || product.warnings}
                emptyLabel={t.notSet}
              />
            </CrudDetailField>
            <CrudDetailField label={`${t.countryOfOrigin} (${t.tabEnglish})`}>
              <TextOrEmpty
                value={product.translations?.en?.countryOfOrigin || product.countryOfOrigin}
                emptyLabel={t.notSet}
              />
            </CrudDetailField>
            <CrudDetailField label={`${t.countryOfOrigin} (${t.tabArabic})`}>
              <TextOrEmpty
                value={product.translations?.ar?.countryOfOrigin}
                emptyLabel={t.notSet}
                rtl
              />
            </CrudDetailField>
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "media" ? (
        <div className="space-y-5">
          <CrudRecordSection title={t.productTabMedia} as="h2">
            {(product.images ?? []).length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {(product.images ?? []).map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-xl border border-border bg-muted/20"
                  >
                    <MediaImage
                      src={image.imageFileUrl ?? undefined}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                    {image.featured ? (
                      <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
                        {t.featured}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.notSet}</p>
            )}
          </CrudRecordSection>
          {product.videoFileUrl ? (
            <CrudRecordSection title={t.productVideo} as="h2">
              <video
                src={product.videoFileUrl}
                controls
                className="max-h-72 w-full rounded-xl border border-border"
              />
            </CrudRecordSection>
          ) : null}
        </div>
      ) : null}

      {activeSection === "attributes" ? (
        <CrudRecordSection
          title={t.productTabAttributes}
          description={
            productType === "SIMPLE"
              ? t.productTabAttributesDescription
              : t.productVariantAttributesTabDescription
          }
          as="h2"
        >
          {productType === "SIMPLE" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.skuCode}>
                <TextOrEmpty value={product.skuCode} emptyLabel={t.notSet} />
              </CrudDetailField>
              <CrudDetailField label={t.eanCode}>
                <TextOrEmpty value={product.eanCode} emptyLabel={t.notSet} />
              </CrudDetailField>
              <CrudDetailField label={t.price}>
                {product.price != null ? formatKwd(product.price) : <EmptyValue label={t.notSet} />}
              </CrudDetailField>
              <CrudDetailField label={t.stock}>{stockDisplay}</CrudDetailField>
              <CrudDetailField label={t.priceDiscount}>
                {product.priceDiscount != null ? formatKwd(product.priceDiscount) : (
                  <EmptyValue label={t.notSet} />
                )}
              </CrudDetailField>
              <CrudDetailField label={t.hasDiscountPrice}>
                {product.hasDiscountPrice ? t.active : t.inactive}
              </CrudDetailField>
              <CrudDetailField label={t.productAttributes}>
                {(product.attributeValues ?? []).length
                  ? product.attributeValues.map(getAttributeItemLabel).join(" · ")
                  : <EmptyValue label={t.notSet} />}
              </CrudDetailField>
            </div>
          ) : (
            <CrudDetailField label={t.productVariantAllowedAttributes}>
              {(product.attributeValues ?? []).length
                ? product.attributeValues.map(getAttributeItemLabel).join(" · ")
                : <EmptyValue label={t.notSet} />}
            </CrudDetailField>
          )}
        </CrudRecordSection>
      ) : null}

      {productType === "VARIABLE_PRODUCT" && activeSection === "variants" ? (
        <CrudRecordSection
          title={t.productTabVariants}
          description={t.productVariantsTabDescription}
          as="h2"
        >
          <div className="space-y-3">
            {(product.variants ?? []).map((variant, index) => (
              <div key={variant.id} className="rounded-xl border border-border bg-muted/10 p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  {t.variantTitle} {index + 1}
                  {getVariantDisplayLabel(variant) ? ` · ${getVariantDisplayLabel(variant)}` : ""}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <CrudDetailField label={t.skuCode}>
                    <TextOrEmpty value={variant.skuCode} emptyLabel={t.notSet} />
                  </CrudDetailField>
                  <CrudDetailField label={t.eanCode}>
                    <TextOrEmpty value={variant.eanCode} emptyLabel={t.notSet} />
                  </CrudDetailField>
                  <CrudDetailField label={t.price}>{formatKwd(variant.price)}</CrudDetailField>
                  <CrudDetailField label={t.stock}>{variant.stock}</CrudDetailField>
                  <CrudDetailField label={t.priceDiscount}>
                    {variant.hasDiscountPrice && variant.priceDiscount != null
                      ? formatKwd(variant.priceDiscount)
                      : <EmptyValue label={t.notSet} />}
                  </CrudDetailField>
                  <CrudDetailField label={t.hasDiscountPrice}>
                    {variant.hasDiscountPrice ? t.active : t.inactive}
                  </CrudDetailField>
                </div>
                {variant.images.length ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {variant.images.map((image) => (
                      <MediaImage
                        key={image.id}
                        src={image.imageFileUrl ?? undefined}
                        alt=""
                        className="aspect-square rounded-lg border border-border object-cover"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "seo" ? (
        <CrudRecordSection title={t.productTabSeo} description={t.productTabSeoDescription} as="h2">
          <div className="grid gap-4 sm:grid-cols-2">
            <CrudDetailField label={t.metaTitle}>
              <TextOrEmpty
                value={product.translations?.en?.metaTitle || product.metaTitle}
                emptyLabel={t.notSet}
              />
            </CrudDetailField>
            <CrudDetailField label={t.metaDescription}>
              <TextOrEmpty
                value={product.translations?.en?.metaDescription || product.metaDescription}
                emptyLabel={t.notSet}
              />
            </CrudDetailField>
            <CrudDetailField label={t.metaFeatureImage}>
              {product.metaFeatureImageFileUrl ? (
                <MediaImage
                  src={product.metaFeatureImageFileUrl}
                  alt=""
                  className="max-h-28 w-auto rounded-md border border-border object-cover"
                />
              ) : (
                <EmptyValue label={t.notSet} />
              )}
            </CrudDetailField>
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "reviews" ? (
        <CrudRecordSection title={t.productTabReviews} as="h2">
          {isReviewsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : reviews.length ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-border bg-muted/10 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {getReviewCustomerLabel(review)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                      <Star className="size-3.5 fill-current" aria-hidden="true" />
                      {review.ratingStar} ★
                    </span>
                  </div>
                  {review.comment ? (
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  ) : null}
                </div>
              ))}
              {totalReviews > reviews.length ? (
                <p className="text-xs text-muted-foreground">
                  {t.showing} {reviews.length} {t.of} {totalReviews} {t.productReviews}
                </p>
              ) : null}
              <AppButton type="button" variant="outline" size="sm" asChild>
                <Link to={reviewsHref}>{t.productTabReviews}</Link>
              </AppButton>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t.noReviews}</p>
              <AppButton type="button" variant="outline" size="sm" asChild>
                <Link to={reviewsHref}>{t.productTabReviews}</Link>
              </AppButton>
            </div>
          )}
        </CrudRecordSection>
      ) : null}
    </CrudRecordWorkspace>
  );
}
