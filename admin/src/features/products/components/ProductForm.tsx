import {
  FileText,
  Images,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Tags,
} from "lucide-react";
import { type MutableRefObject, useEffect, useMemo, useRef, useState } from "react";

import { ROUTES } from "@/app/router/routes";
import { AttributeValueSelector } from "@/features/products/components/AttributeValueSelector";
import { BrandPicker } from "@/features/products/components/BrandPicker";
import { CategoryMultiPicker } from "@/features/products/components/CategoryMultiPicker";
import { ProductDiscountFields } from "@/features/products/components/ProductDiscountFields";
import { ProductFormPreviewCard } from "@/features/products/components/ProductFormPreviewCard";
import { ProductImageGalleryFields } from "@/features/products/components/ProductImageGalleryFields";
import { ProductSeoFields } from "@/features/products/components/ProductSeoFields";
import { ProductSlugUpdateDialog } from "@/features/products/components/ProductSlugUpdateDialog";
import { ProductStorefrontUrlCopyButton } from "@/features/products/components/ProductStorefrontUrlCopyButton";
import { ProductTranslationFields } from "@/features/products/components/ProductTranslationFields";
import { ProductVariantFields } from "@/features/products/components/ProductVariantFields";
import { TagMultiPicker } from "@/features/products/components/TagMultiPicker";
import type { Product, ProductFormData } from "@/features/products/types/products.types";
import {
  collectClearedProductFieldLabels,
  createEmptyProductForm,
  createEmptyProductVariantFormItem,
  productToFormData,
  sanitizeVariantsAgainstAttributePool,
} from "@/features/products/types/products.types";
import { buildAttributeSeedsFromProduct } from "@/features/products/utils/build-attribute-seeds-from-product";
import { describeProductFormEdits } from "@/features/products/utils/describe-product-form-edits";
import {
  getFormFeaturedImageUrl,
  getProductFormCompleteness,
  type ProductFormSectionId,
} from "@/features/products/utils/product-form-completeness";
import { replaceProductImageSlot } from "@/features/products/utils/product-image-slot.utils";
import {
  getLocalesNeedingSlugUpdatePrompt,
  type ProductSlugUpdatePrompt,
} from "@/features/products/utils/product-slug.utils";
import {
  AppButton,
  ConfirmDialog,
  DatePickerField,
  SelectField,
  TextField,
  ToggleField,
} from "@/shared/components";
import { CrudFileUpload, CrudRecordSection, CrudRecordWorkspace } from "@/shared/crud";
import { Switch } from "@/shared/design-system/components/ui/switch";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { CRUD_FORM_FIELD_ANCHORS, PRODUCT_FORM_ANCHORS } from "@/shared/guidance/constants/guidance.constants";

type ProductFormProps = {
  mode: "create" | "edit";
  product?: Product | null;
  /** Bump after a successful save so the form reloads server fields (images, slugs). */
  hydrateKey?: number;
  isLoading?: boolean;
  onSubmit: (data: ProductFormData, originalForm?: ProductFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  unsavedEditsRef?: MutableRefObject<string[]>;
};

function hasValidVariantAttributes(
  variant: ProductFormData["variants"][number],
  poolAttributeIds: number[],
  poolAttributeValueIds: number[],
): boolean {
  if (poolAttributeIds.length === 0) return false;
  if (variant.attributeIds.length !== poolAttributeIds.length) return false;
  if (variant.attributeValueIds.length !== poolAttributeIds.length) return false;
  if (!poolAttributeIds.every((id) => variant.attributeIds.includes(id))) return false;
  return variant.attributeValueIds.every((id) => poolAttributeValueIds.includes(id));
}

function isVariantAttributePoolConfigured(form: ProductFormData): boolean {
  return form.attributeIds.length > 0 && form.attributeValueIds.length > 0;
}

function hasValidVariantImages(variant: ProductFormData["variants"][number]): boolean {
  return variant.images.some((image) => image.file instanceof File || Boolean(image.id));
}

function isVariantComplete(
  variant: ProductFormData["variants"][number],
  poolAttributeIds: number[],
  poolAttributeValueIds: number[],
): boolean {
  return (
    Boolean(variant.skuCode.trim()) &&
    Boolean(variant.eanCode.trim()) &&
    hasValidVariantAttributes(variant, poolAttributeIds, poolAttributeValueIds) &&
    hasValidVariantImages(variant)
  );
}

export function ProductForm({
  mode,
  product,
  hydrateKey = 0,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
  unsavedEditsRef,
}: ProductFormProps) {
  const t = useTranslation();
  const persistInFlightRef = useRef(false);
  const typeOptions = useMemo(
    () => [
      { label: t.productTypeSimple, value: "SIMPLE" as const },
      { label: t.productTypeVariant, value: "VARIABLE_PRODUCT" as const },
    ],
    [t.productTypeSimple, t.productTypeVariant],
  );
  const relationSeeds = useMemo(
    () => ({
      brand: product?.brand ?? null,
      categories: product?.categories ?? [],
      tags: product?.tags ?? [],
    }),
    [product],
  );
  const attributeSeeds = useMemo(
    () => (product ? buildAttributeSeedsFromProduct(product) : []),
    [product],
  );
  const [form, setForm] = useState<ProductFormData>(createEmptyProductForm());
  const [initialForm, setInitialForm] = useState<ProductFormData | null>(null);
  const [activeTab, setActiveTab] = useState<ProductFormSectionId>("general");
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [imagesError, setImagesError] = useState<string | undefined>();
  const [variantsError, setVariantsError] = useState<string | undefined>();
  const [attributesError, setAttributesError] = useState<string | undefined>();
  const [discountError, setDiscountError] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);
  const [clearedFieldsConfirm, setClearedFieldsConfirm] = useState<string[] | null>(null);
  const [activeSlugPrompt, setActiveSlugPrompt] = useState<ProductSlugUpdatePrompt | null>(null);
  const [slugUpdateDraft, setSlugUpdateDraft] = useState("");
  const pendingSubmitFormRef = useRef<ProductFormData | null>(null);
  const slugPromptQueueRef = useRef<ProductSlugUpdatePrompt[]>([]);
  const productRef = useRef(product);
  productRef.current = product;

  useEffect(() => {
    const source = productRef.current;
    const nextForm = source ? productToFormData(source) : createEmptyProductForm();
    setForm(nextForm);
    setInitialForm(mode === "edit" ? nextForm : null);
    setTitleErrors({});
    setImagesError(undefined);
    setVariantsError(undefined);
    setAttributesError(undefined);
    setDiscountError(undefined);
    setIsDirty(false);
  }, [hydrateKey, mode, product?.id]);

  useEffect(() => {
    setActiveTab("general");
  }, [mode, product?.id]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const editLabels = useMemo(
    () => ({
      brand: t.brand,
      categories: t.categoriesCol,
      tags: t.tags,
      productType: t.productType,
      publish: t.publish,
      featured: t.featured,
      bestSeller: t.bestSeller,
      newlyArrived: t.newlyArrived,
      isProductYouWillLove: t.isProductYouWillLove,
      approveAddToCarePlan: t.approveAddToCarePlan,
      skuCode: t.skuCode,
      eanCode: t.eanCode,
      price: t.price,
      stock: t.stock,
      priceDiscount: t.priceDiscount,
      expiryStartDate: t.expiryStartDate,
      expiryEndDate: t.expiryEndDate,
      titleEnglish: t.titleEnglish,
      titleArabic: t.titleArabic,
      description: t.description,
      benefits: t.benefits,
      ingredients: t.ingredients,
      usageMethod: t.usageMethod,
      warnings: t.warnings,
      countryOfOrigin: t.countryOfOrigin,
      metaTitle: t.metaTitle,
      metaDescription: t.metaDescription,
      productTabMedia: t.productTabMedia,
      productVideo: t.productVideo,
      productTabVariants: t.productTabVariants,
      productTabAttributes: t.productTabAttributes,
      metaFeatureImage: t.metaFeatureImage,
      tabEnglish: t.tabEnglish,
      tabArabic: t.tabArabic,
    }),
    [t],
  );

  useEffect(() => {
    if (!unsavedEditsRef) return;
    const baseline = initialForm ?? createEmptyProductForm();
    unsavedEditsRef.current = describeProductFormEdits(baseline, form, editLabels);
  }, [editLabels, form, initialForm, unsavedEditsRef]);

  const updateForm = (updater: (current: ProductFormData) => ProductFormData) => {
    setForm(updater);
    setIsDirty(true);
  };

  const handleTypeChange = (nextType: ProductFormData["type"]) => {
    if (nextType === "SIMPLE" && activeTab === "variants") {
      setActiveTab("attributes");
    }
    updateForm((current) => {
      if (nextType === "SIMPLE") {
        const sourceVariant = current.variants[0];
        return {
          ...current,
          type: nextType,
          skuCode: current.skuCode || sourceVariant?.skuCode || "",
          eanCode: current.eanCode || sourceVariant?.eanCode || "",
          price: current.price || sourceVariant?.price || 0,
          stock: current.stock || sourceVariant?.stock || 0,
          attributeIds: current.attributeIds.length
            ? current.attributeIds
            : (sourceVariant?.attributeIds ?? []),
          attributeValueIds: current.attributeValueIds.length
            ? current.attributeValueIds
            : (sourceVariant?.attributeValueIds ?? []),
          variants: [createEmptyProductVariantFormItem()],
          deletedVariantIds: [],
        };
      }

      if (nextType === "VARIABLE_PRODUCT") {
        if (current.type === "SIMPLE") {
          return {
            ...current,
            type: nextType,
            skuCode: "",
            eanCode: "",
            price: 0,
            stock: 0,
            attributeIds: [...current.attributeIds],
            attributeValueIds: [...current.attributeValueIds],
            variants: [
              {
                ...createEmptyProductVariantFormItem(),
                skuCode: current.skuCode,
                eanCode: current.eanCode,
                price: current.price,
                stock: current.stock,
                attributeIds: [...current.attributeIds],
                attributeValueIds: [...current.attributeValueIds],
              },
            ],
            deletedVariantIds: [],
          };
        }

        const poolAttributeIds = current.attributeIds.length
          ? current.attributeIds
          : [...new Set(current.variants.flatMap((variant) => variant.attributeIds))];
        const poolAttributeValueIds = current.attributeValueIds.length
          ? current.attributeValueIds
          : [...new Set(current.variants.flatMap((variant) => variant.attributeValueIds))];

        return {
          ...current,
          type: nextType,
          skuCode: "",
          eanCode: "",
          price: 0,
          stock: 0,
          attributeIds: poolAttributeIds,
          attributeValueIds: poolAttributeValueIds,
          variants: sanitizeVariantsAgainstAttributePool(
            current.variants.length ? current.variants : [createEmptyProductVariantFormItem()],
            poolAttributeIds,
            poolAttributeValueIds,
          ),
        };
      }

      return current;
    });
  };

  const validateForm = (): { valid: boolean; errorTab?: string } => {
    const nextTitleErrors: Partial<Record<"en" | "ar", string>> = {};
    const localeHasTranslationContent = (locale: "en" | "ar"): boolean => {
      const translation = form.translations[locale];
      if (!translation) return false;
      return Boolean(
        translation.title?.trim() ||
          translation.slug?.trim() ||
          translation.description?.trim() ||
          translation.metaTitle?.trim() ||
          translation.metaDescription?.trim() ||
          translation.benefits?.trim() ||
          translation.ingredients?.trim() ||
          translation.usageMethod?.trim() ||
          translation.warnings?.trim() ||
          translation.countryOfOrigin?.trim(),
      );
    };

    // Any locale with content must have a title — otherwise the API inserts
    // product_translations without title and MySQL rejects it (no default).
    for (const locale of ["en", "ar"] as const) {
      if (localeHasTranslationContent(locale) && !form.translations[locale]?.title?.trim()) {
        nextTitleErrors[locale] = t.required;
      }
    }

    // Create requires at least one title when both locales are still empty.
    if (
      mode === "create" &&
      !form.translations.en?.title?.trim() &&
      !form.translations.ar?.title?.trim()
    ) {
      nextTitleErrors.en = t.required;
    }
    setTitleErrors(nextTitleErrors);

    let valid = Object.keys(nextTitleErrors).length === 0;
    let errorTab: string | undefined;

    if (mode === "create") {
      const hasValidImage = form.images.some((image) => image.file instanceof File);
      if (!hasValidImage) {
        setImagesError(t.productImagesRequired);
        valid = false;
        errorTab ??= "media";
      } else {
        setImagesError(undefined);
      }
    }

    const isSaleDiscountIncomplete = (
      hasDiscountPrice: boolean,
      price: number,
      priceDiscount: number | null,
    ): boolean => {
      if (!hasDiscountPrice) return false;
      if (priceDiscount == null || Number(priceDiscount) <= 0) return true;
      return Number(priceDiscount) >= Number(price);
    };

    if (form.type === "SIMPLE") {
      // Create requires SKU, price, and stock. EAN is optional.
      if (mode === "create") {
        const hasSimpleInventory =
          form.skuCode.trim() && form.price >= 0 && form.stock >= 0;

        if (!hasSimpleInventory) {
          setAttributesError(t.productSimpleInventoryRequired);
          valid = false;
          errorTab = "attributes";
        } else {
          setAttributesError(undefined);
        }
      } else {
        setAttributesError(undefined);
      }

      if (isSaleDiscountIncomplete(form.hasDiscountPrice, form.price, form.priceDiscount)) {
        setDiscountError(t.priceDiscountRequired);
        valid = false;
        errorTab ??= "attributes";
      } else {
        setDiscountError(undefined);
      }
      setVariantsError(undefined);
    } else {
      if (!isVariantAttributePoolConfigured(form)) {
        setAttributesError(t.productVariantAttributesRequired);
        valid = false;
        errorTab = "attributes";
      } else {
        setAttributesError(undefined);
      }

      setDiscountError(undefined);

      const invalidDiscountVariants = form.variants.filter((variant) =>
        isSaleDiscountIncomplete(variant.hasDiscountPrice, variant.price, variant.priceDiscount),
      );

      if (mode === "create") {
        const allVariantsComplete =
          form.variants.length >= 1 &&
          form.variants.every((variant) =>
            isVariantComplete(variant, form.attributeIds, form.attributeValueIds),
          );

        if (!allVariantsComplete) {
          setVariantsError(t.productVariantsRequired);
          valid = false;
          errorTab ??= "variants";
        } else if (invalidDiscountVariants.length > 0) {
          setVariantsError(t.priceDiscountRequired);
          valid = false;
          errorTab ??= "variants";
        } else {
          setVariantsError(undefined);
        }
      } else {
        const incompleteVariants = form.variants.filter(
          (variant) =>
            !isVariantComplete(variant, form.attributeIds, form.attributeValueIds),
        );

        if (incompleteVariants.length > 0) {
          setVariantsError(t.productVariantsRequired);
          valid = false;
          errorTab ??= "variants";
        } else if (invalidDiscountVariants.length > 0) {
          setVariantsError(t.priceDiscountRequired);
          valid = false;
          errorTab ??= "variants";
        } else {
          setVariantsError(undefined);
        }
      }
    }

    if (!form.brandId) {
      valid = false;
      errorTab ??= "general";
    }
    if (!form.categoryIds.length) {
      valid = false;
      errorTab ??= "general";
    }

    if (!valid && Object.keys(nextTitleErrors).length > 0) {
      errorTab ??= "general";
    }

    return { valid, errorTab: errorTab as ProductFormSectionId | undefined };
  };

  const submitForm = (formOverride?: ProductFormData) => {
    if (persistInFlightRef.current) return;
    persistInFlightRef.current = true;
    void Promise.resolve(onSubmit(formOverride ?? form, initialForm ?? undefined)).finally(() => {
      persistInFlightRef.current = false;
    });
  };

  const beginSlugUpdatePrompts = (prompts: ProductSlugUpdatePrompt[], formSnapshot: ProductFormData) => {
    pendingSubmitFormRef.current = formSnapshot;
    slugPromptQueueRef.current = prompts;
    showNextSlugPrompt();
  };

  const showNextSlugPrompt = () => {
    const [nextPrompt, ...remainingPrompts] = slugPromptQueueRef.current;
    slugPromptQueueRef.current = remainingPrompts;

    if (!nextPrompt) {
      const formSnapshot = pendingSubmitFormRef.current;
      setActiveSlugPrompt(null);
      setSlugUpdateDraft("");
      pendingSubmitFormRef.current = null;
      if (formSnapshot) {
        submitForm(formSnapshot);
      }
      return;
    }

    setActiveSlugPrompt(nextPrompt);
    setSlugUpdateDraft(nextPrompt.suggestedSlug);
  };

  const handleKeepCurrentSlug = () => {
    showNextSlugPrompt();
  };

  const handleUpdateSlug = () => {
    if (!activeSlugPrompt) return;

    const baseForm = pendingSubmitFormRef.current ?? form;
    const locale = activeSlugPrompt.locale;
    pendingSubmitFormRef.current = {
      ...baseForm,
      translations: {
        ...baseForm.translations,
        [locale]: {
          title: baseForm.translations[locale]?.title ?? "",
          slug: slugUpdateDraft.trim(),
          description: baseForm.translations[locale]?.description ?? "",
          metaTitle: baseForm.translations[locale]?.metaTitle ?? "",
          metaDescription: baseForm.translations[locale]?.metaDescription ?? "",
          benefits: baseForm.translations[locale]?.benefits ?? "",
          ingredients: baseForm.translations[locale]?.ingredients ?? "",
          usageMethod: baseForm.translations[locale]?.usageMethod ?? "",
          warnings: baseForm.translations[locale]?.warnings ?? "",
          countryOfOrigin: baseForm.translations[locale]?.countryOfOrigin ?? "",
        },
      },
    };

    showNextSlugPrompt();
  };

  const getClearedFieldLabels = (): string[] => {
    if (mode !== "edit" || !initialForm) return [];
    return collectClearedProductFieldLabels(initialForm, form, {
      skuCode: t.skuCode,
      eanCode: t.eanCode,
      expiryStartDate: t.expiryStartDate,
      expiryEndDate: t.expiryEndDate,
      titleEnglish: t.titleEnglish,
      titleArabic: t.titleArabic,
      description: t.description,
      benefits: t.benefits,
      ingredients: t.ingredients,
      usageMethod: t.usageMethod,
      warnings: t.warnings,
      countryOfOrigin: t.countryOfOrigin,
      productTabAttributes: t.productTabAttributes,
      tabEnglish: t.tabEnglish,
      tabArabic: t.tabArabic,
    });
  };

  const persist = () => {
    if (isLoading || persistInFlightRef.current) return;
    const { valid, errorTab } = validateForm();
    if (!valid) {
      if (errorTab) setActiveTab(errorTab as ProductFormSectionId);
      return;
    }

    const clearedLabels = getClearedFieldLabels();
    if (clearedLabels.length > 0) {
      setClearedFieldsConfirm(clearedLabels);
      return;
    }

    if (mode === "edit" && initialForm) {
      const slugPrompts = getLocalesNeedingSlugUpdatePrompt(initialForm, form);
      if (slugPrompts.length > 0) {
        beginSlugUpdatePrompts(slugPrompts, form);
        return;
      }
    }

    submitForm();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    persist();
  };

  const isVariantPoolConfigured = isVariantAttributePoolConfigured(form);
  const completeness = getProductFormCompleteness(form, mode);
  const featuredImage = form.images.find((image) => image.featured) ?? form.images[0];
  const previewVariant = form.variants[0];
  const previewPrice =
    form.type === "VARIABLE_PRODUCT"
      ? Number(previewVariant?.price ?? 0)
      : Number(form.price);
  const previewSku =
    form.type === "VARIABLE_PRODUCT"
      ? previewVariant?.skuCode ?? form.skuCode
      : form.skuCode;
  const previewStock =
    form.type === "VARIABLE_PRODUCT"
      ? Number(previewVariant?.stock ?? 0)
      : Number(form.stock);
  const liveTitle =
    form.translations.en?.title?.trim() ||
    form.translations.ar?.title?.trim() ||
    (mode === "create" ? t.newProduct : t.editProduct);
  const sectionItems: {
    id: ProductFormSectionId;
    label: string;
    icon: typeof LayoutGrid;
    guidance?: string;
    error?: boolean;
  }[] = [
    {
      id: "general",
      label: t.productTabGeneral,
      icon: LayoutGrid,
      guidance: PRODUCT_FORM_ANCHORS.tabGeneral,
      error: Boolean(titleErrors.en || titleErrors.ar) || !form.brandId || !form.categoryIds.length,
    },
    { id: "content", label: t.productTabContent, icon: FileText, guidance: PRODUCT_FORM_ANCHORS.tabContent },
    {
      id: "media",
      label: t.productTabMedia,
      icon: Images,
      guidance: PRODUCT_FORM_ANCHORS.tabMedia,
      error: Boolean(imagesError),
    },
    {
      id: "attributes",
      label: t.productTabAttributes,
      icon: Tags,
      guidance: PRODUCT_FORM_ANCHORS.tabAttributes,
      error: Boolean(attributesError),
    },
    ...(form.type === "VARIABLE_PRODUCT"
      ? [
          {
            id: "variants" as const,
            label: t.productTabVariants,
            icon: SlidersHorizontal,
            guidance: PRODUCT_FORM_ANCHORS.tabVariants,
            error: Boolean(variantsError),
          },
        ]
      : []),
    { id: "seo", label: t.productTabSeo, icon: Search, guidance: PRODUCT_FORM_ANCHORS.tabSeo },
  ];

  const handleAttributePoolChange = (attributeIds: number[], attributeValueIds: number[]) => {
    updateForm((current) => ({
      ...current,
      attributeIds,
      attributeValueIds,
      variants: sanitizeVariantsAgainstAttributePool(
        current.variants,
        attributeIds,
        attributeValueIds,
      ),
    }));
  };

  const setSection = (section: ProductFormSectionId) => {
    setActiveTab(section);
  };

  const completenessLabels: Record<string, string> = {
    title: t.titleEnglish,
    brand: t.brand,
    categories: t.categoriesCol,
    media: t.productTabMedia,
    pricing: form.type === "VARIABLE_PRODUCT" ? t.productTabVariants : t.price,
    seo: t.productTabSeo,
  };

  return (
    <>
      <CrudRecordWorkspace
        asForm
        onSubmit={handleSubmit}
        onPersist={persist}
        workspaceGuidance={PRODUCT_FORM_ANCHORS.workspace}
        breadcrumbHref={ROUTES.admin.products}
        breadcrumbLabel={t.products2}
        title={liveTitle}
        subtitle={t.productWorkspaceHint}
        meta={
          product?.id ? (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {t.idLabel}: {product.id}
            </span>
          ) : null
        }
        dirty={isDirty}
        dirtyLabel={t.productUnsaved}
        onBack={onCancel}
        backLabel={t.backToProducts}
        headerActions={
          <>
            <ProductStorefrontUrlCopyButton
              product={product}
              translations={form.translations}
              showViewLink={Boolean(product?.id)}
            />
            <div className="me-1 hidden items-center gap-2 rounded-xl border border-border/80 px-3 py-1.5 sm:flex">
              <span className="text-xs font-medium text-muted-foreground">{t.publish}</span>
              <Switch
                checked={form.publish}
                onCheckedChange={(checked) =>
                  updateForm((current) => ({ ...current, publish: checked }))
                }
                aria-label={t.publish}
              />
            </div>
            <AppButton type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              {t.cancel}
            </AppButton>
            <AppButton
              type="submit"
              isLoading={isLoading}
              loadingText={t.loadingMessage}
              data-guidance={CRUD_FORM_FIELD_ANCHORS.actions}
            >
              {mode === "create" ? t.addProduct : t.save}
            </AppButton>
          </>
        }
        sections={sectionItems}
        activeSection={activeTab}
        onSectionChange={setSection}
        sectionsAriaLabel={t.productFormSections}
        sectionsGuidance={PRODUCT_FORM_ANCHORS.sectionNav}
        aside={
          <ProductFormPreviewCard
            titleEn={form.translations.en?.title ?? ""}
            titleAr={form.translations.ar?.title ?? ""}
            published={form.publish}
            featuredImageUrl={getFormFeaturedImageUrl(form)}
            featuredImageFile={featuredImage?.file ?? null}
            metaTitle={form.translations.en?.metaTitle || form.translations.ar?.metaTitle || ""}
            metaDescription={
              form.translations.en?.metaDescription || form.translations.ar?.metaDescription || ""
            }
            brandId={form.brandId}
            brandSeed={relationSeeds.brand}
            price={previewPrice}
            skuCode={previewSku}
            stock={previewStock}
            completeness={completeness}
            completenessLabels={completenessLabels}
            onJumpToSection={setSection}
            onFeaturedImageFile={(file) => {
              const featuredIndex = form.images.findIndex((image) => image.featured);
              const next = replaceProductImageSlot(
                form.images,
                form.deletedImageIds,
                featuredIndex >= 0 ? featuredIndex : 0,
                file,
              );
              updateForm((current) => ({
                ...current,
                images: next.images,
                deletedImageIds: next.deletedImageIds,
              }));
              setActiveTab("media");
            }}
          />
        }
      >
        {activeTab === "general" ? (
          <div className="space-y-5">
          <CrudRecordSection title={t.productTabGeneral} dataGuidance={PRODUCT_FORM_ANCHORS.content}>
            <ProductTranslationFields
              value={form.translations}
              onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
              titleErrors={titleErrors}
              autoFocusFirstField
              autoFillEmptySlugs={mode === "create"}
              fields="titles"
            />
            <BrandPicker
              value={form.brandId}
              seedItem={relationSeeds.brand}
              onChange={(brandId) => updateForm((current) => ({ ...current, brandId }))}
            />
            <CategoryMultiPicker
              value={form.categoryIds}
              seedItems={relationSeeds.categories}
              onChange={(categoryIds) => updateForm((current) => ({ ...current, categoryIds }))}
            />
            <TagMultiPicker
              value={form.tagIds}
              seedItems={relationSeeds.tags}
              onChange={(tagIds) => updateForm((current) => ({ ...current, tagIds }))}
              required={false}
            />
            <div data-guidance={PRODUCT_FORM_ANCHORS.type}>
              <SelectField
                label={t.productType}
                value={form.type}
                onValueChange={(value) => handleTypeChange(value as ProductFormData["type"])}
                options={typeOptions}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DatePickerField
                label={t.expiryStartDate}
                mode="date"
                value={form.expiryStartDate}
                onChange={(expiryStartDate) =>
                  updateForm((current) => ({ ...current, expiryStartDate }))
                }
              />
              <DatePickerField
                label={t.expiryEndDate}
                mode="date"
                value={form.expiryEndDate}
                onChange={(expiryEndDate) =>
                  updateForm((current) => ({ ...current, expiryEndDate }))
                }
                min={form.expiryStartDate || undefined}
              />
            </div>
          </CrudRecordSection>

          <CrudRecordSection title={t.productVisibility} dataGuidance={PRODUCT_FORM_ANCHORS.visibility}>
            <ToggleField
              label={t.publish}
              checked={form.publish}
              onCheckedChange={(checked) => updateForm((current) => ({ ...current, publish: checked }))}
            />
            <ToggleField
              label={t.featured}
              checked={form.featured}
              onCheckedChange={(checked) => updateForm((current) => ({ ...current, featured: checked }))}
            />
            <ToggleField
              label={t.bestSeller}
              checked={form.bestSeller}
              onCheckedChange={(checked) =>
                updateForm((current) => ({ ...current, bestSeller: checked }))
              }
            />
            <ToggleField
              label={t.newlyArrived}
              checked={form.newlyArrived}
              onCheckedChange={(checked) =>
                updateForm((current) => ({ ...current, newlyArrived: checked }))
              }
            />
            <ToggleField
              label={t.isProductYouWillLove}
              checked={form.isProductYouWillLove}
              onCheckedChange={(checked) =>
                updateForm((current) => ({ ...current, isProductYouWillLove: checked }))
              }
            />
            <ToggleField
              label={t.approveAddToCarePlan}
              checked={form.approveAddToCarePlan}
              onCheckedChange={(checked) =>
                updateForm((current) => ({ ...current, approveAddToCarePlan: checked }))
              }
            />
          </CrudRecordSection>
          </div>
        ) : null}

        {activeTab === "content" ? (
          <CrudRecordSection title={t.productTabContent}>
            <ProductTranslationFields
              value={form.translations}
              onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
              fields="body"
              showSlugPreview={false}
            />
          </CrudRecordSection>
        ) : null}

        {activeTab === "seo" ? (
          <CrudRecordSection
            title={t.productTabSeo}
            description={t.productTabSeoDescription}
            dataGuidance={PRODUCT_FORM_ANCHORS.seo}
          >
            <ProductSeoFields
              value={form.translations}
              onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
              metaFeatureImage={form.metaFeatureImage}
              metaFeatureImageUrl={product?.metaFeatureImageFileUrl}
              onMetaFeatureImageChange={(metaFeatureImage) =>
                updateForm((current) => ({ ...current, metaFeatureImage }))
              }
            />
          </CrudRecordSection>
        ) : null}

        {activeTab === "media" ? (
          <div className="space-y-5">
          <CrudRecordSection title={t.productTabMedia} dataGuidance={PRODUCT_FORM_ANCHORS.media}>
            <ProductImageGalleryFields
              images={form.images}
              deletedImageIds={form.deletedImageIds}
              onChange={(images, deletedImageIds) =>
                updateForm((current) => ({ ...current, images, deletedImageIds }))
              }
              error={imagesError}
            />
          </CrudRecordSection>

          <CrudRecordSection title={t.productVideo}>
            {product?.videoFileUrl && !form.video ? (
              <div className="space-y-2">
                <video
                  src={product.videoFileUrl}
                  controls
                  className="max-h-40 w-full rounded-lg border border-border"
                />
                <p className="text-xs text-muted-foreground">{t.clickToChangeVideo}</p>
              </div>
            ) : null}
            <CrudFileUpload
              label={product?.videoFileUrl && !form.video ? t.clickToChangeVideo : t.productVideo}
              accept="video/mp4,video/webm,video/quicktime"
              value={form.video}
              onFileSelect={(file) => updateForm((current) => ({ ...current, video: file }))}
            />
          </CrudRecordSection>
          </div>
        ) : null}

        {activeTab === "attributes" ? (
          form.type === "SIMPLE" ? (
            <CrudRecordSection
              title={t.productTabAttributes}
              description={t.productTabAttributesDescription}
              dataGuidance={PRODUCT_FORM_ANCHORS.attributes}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label={t.skuCode}
                  value={form.skuCode}
                  onChange={(event) =>
                    updateForm((current) => ({ ...current, skuCode: event.target.value }))
                  }
                  required
                />
                <TextField
                  label={t.eanCode}
                  value={form.eanCode}
                  onChange={(event) =>
                    updateForm((current) => ({ ...current, eanCode: event.target.value }))
                  }
                  required={false}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label={t.price}
                  type="number"
                  min={0}
                  step="0.1"
                  value={String(form.price)}
                  onChange={(event) =>
                    updateForm((current) => ({
                      ...current,
                      price: Number(event.target.value) || 0,
                    }))
                  }
                  required
                />
                <TextField
                  label={t.stock}
                  type="number"
                  min={0}
                  value={String(form.stock)}
                  onChange={(event) =>
                    updateForm((current) => ({
                      ...current,
                      stock: Number(event.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>
              <ToggleField
                label={t.hasDiscountPrice}
                checked={form.hasDiscountPrice}
                onCheckedChange={(checked) => {
                  if (!checked) setDiscountError(undefined);
                  updateForm((current) => ({
                    ...current,
                    hasDiscountPrice: checked,
                    ...(checked
                      ? {}
                      : {
                          priceDiscount: null,
                          priceDiscountPercentage: "",
                          discountStartAt: "",
                          discountExpireAt: "",
                        }),
                  }));
                }}
              />
              {form.hasDiscountPrice ? (
                <ProductDiscountFields
                  price={form.price}
                  priceDiscount={form.priceDiscount}
                  priceDiscountPercentage={form.priceDiscountPercentage}
                  discountStartAt={form.discountStartAt}
                  discountExpireAt={form.discountExpireAt}
                  onChange={(discount) => {
                    setDiscountError(undefined);
                    updateForm((current) => ({ ...current, ...discount }));
                  }}
                  showRequiredError={Boolean(discountError)}
                />
              ) : null}
              <AttributeValueSelector
                attributeIds={form.attributeIds}
                attributeValueIds={form.attributeValueIds}
                onChange={(attributeIds, attributeValueIds) =>
                  updateForm((current) => ({ ...current, attributeIds, attributeValueIds }))
                }
                selectionMode="multi"
                seedAttributes={attributeSeeds}
                enabled={activeTab === "attributes"}
                error={attributesError}
                required={false}
                showVariableProductHint
                allowCreateAttribute
              />
            </CrudRecordSection>
          ) : (
            <CrudRecordSection
              title={t.productTabAttributes}
              description={t.productVariantAttributesTabDescription}
              dataGuidance={PRODUCT_FORM_ANCHORS.attributes}
            >
              <AttributeValueSelector
                attributeIds={form.attributeIds}
                attributeValueIds={form.attributeValueIds}
                onChange={handleAttributePoolChange}
                selectionMode="multi"
                seedAttributes={attributeSeeds}
                enabled={activeTab === "attributes"}
                error={attributesError}
                label={t.productVariantAllowedAttributes}
                allowCreateAttribute
              />
            </CrudRecordSection>
          )
        ) : null}

        {form.type === "VARIABLE_PRODUCT" && activeTab === "variants" ? (
            <CrudRecordSection
              title={t.productTabVariants}
              description={t.productVariantsTabDescription}
            >
              <ProductVariantFields
                type={form.type}
                variants={form.variants}
                deletedVariantIds={form.deletedVariantIds}
                onChange={(variants, deletedVariantIds) => {
                  setVariantsError(undefined);
                  updateForm((current) => ({ ...current, variants, deletedVariantIds }));
                }}
                error={variantsError}
                showDiscountRequiredError={variantsError === t.priceDiscountRequired}
                allowedAttributeIds={form.attributeIds}
                allowedAttributeValueIds={form.attributeValueIds}
                isAttributePoolConfigured={isVariantPoolConfigured}
                seedAttributes={attributeSeeds}
              />
            </CrudRecordSection>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4 xl:hidden">
          <AppButton type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {t.cancel}
          </AppButton>
          <AppButton type="submit" isLoading={isLoading} loadingText={t.loadingMessage}>
            {mode === "create" ? t.addProduct : t.save}
          </AppButton>
        </div>
      </CrudRecordWorkspace>

      <ConfirmDialog
        open={clearedFieldsConfirm != null}
        onOpenChange={(open) => {
          if (!open) setClearedFieldsConfirm(null);
        }}
        title={t.clearEmptyFieldsTitle}
        description={
          clearedFieldsConfirm
            ? t.clearEmptyFieldsDescription.replace(
                "{fields}",
                clearedFieldsConfirm.join(", "),
              )
            : undefined
        }
        confirmLabel={t.clearEmptyFieldsConfirm}
        cancelLabel={t.cancel}
        variant="destructive"
        onConfirm={() => {
          setClearedFieldsConfirm(null);
          if (mode === "edit" && initialForm) {
            const slugPrompts = getLocalesNeedingSlugUpdatePrompt(initialForm, form);
            if (slugPrompts.length > 0) {
              beginSlugUpdatePrompts(slugPrompts, form);
              return;
            }
          }
          submitForm();
        }}
      />

      <ProductSlugUpdateDialog
        open={activeSlugPrompt != null}
        prompt={activeSlugPrompt}
        draftSlug={slugUpdateDraft}
        onDraftSlugChange={setSlugUpdateDraft}
        onKeepCurrentSlug={handleKeepCurrentSlug}
        onUpdateSlug={handleUpdateSlug}
      />
    </>
  );
}
