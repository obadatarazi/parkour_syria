import { PRODUCT_IMPORT_REQUEST_TIMEOUT_MS } from "@/features/products/constants/product-import-batch";
import { productVariantsService } from "@/features/products/services/product-variants.service";
import type {
  ProductBulkAdjustPriceInput,
  ProductBulkAdjustPriceResult,
  ProductBulkUpdateEntry,
  ProductBulkUpdateVariantEntry,
  ProductsService,
  ProductTrashBulkApiResult,
} from "@/features/products/services/products.service.types";
import type { ProductImportSummary } from "@/features/products/types/product-import.types";
import type {
  Product,
  ProductFormData,
  ProductImageFormItem,
  ProductListParams,
  ProductType,
  ProductVariantFormItem,
} from "@/features/products/types/products.types";
import { fromDatetimeLocalValue } from "@/features/products/types/products.types";
import { mapProductFromApi } from "@/features/products/utils/map-product-from-api";
import { mapProductImportFromApi } from "@/features/products/utils/map-product-import-from-api";
import { uniqueNumberIds } from "@/features/products/utils/variant-attribute.utils";
import { ServiceError } from "@/shared/errors";
import {
  apiRequest,
  appendBoolean,
  appendFile,
  appendNumberArray,
  appendOptional,
  appendOptionalDecimal,
  appendProductTranslations,
  buildLaravelListParams,
  type BulkDeleteApiResult,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
  submitMultipartFormData,
  toBulkDeleteIds,
} from "@/shared/lib/api";
import {
  decodeAdminRouteKey,
  isNumericAdminRouteKey,
} from "@/shared/lib/routing/admin-route-keys.utils";

function buildProductListQueryParams(params: ProductListParams) {
  return buildLaravelListParams(
    {
      page: params.page,
      limit: params.limit,
      search: params.search,
      publish: params.publish,
      brandId: params.brandId,
      type: params.type,
      categoryId: params.categoryId,
      tagId: params.tagId,
      featured: params.featured,
      bestSeller: params.bestSeller,
      newlyArrived: params.newlyArrived,
      isProductYouWillLove: params.isProductYouWillLove,
      skuCode: params.skuCode,
      eanCode: params.eanCode,
      attributeId: params.attributeId,
      attributeValueId: params.attributeValueId,
      approveAddToCarePlan: params.approveAddToCarePlan,
      sort: params.sort,
      direction: params.direction,
    },
    { limit: 12 },
  );
}

async function postProductTrashBulk(
  path: string,
  ids: Array<string | number>,
): Promise<BulkDeleteApiResult> {
  const numericIds = toBulkDeleteIds(ids);
  if (numericIds.length === 0) {
    return { deletedCount: 0, deletedIds: [], notFoundIds: [] };
  }

  const response = await apiRequest<LaravelSuccessResponse<ProductTrashBulkApiResult>>(path, {
    method: "POST",
    body: { ids: numericIds },
    timeoutMs: 120_000,
  });

  return {
    deletedCount: response.data.count,
    deletedIds: response.data.ids,
    notFoundIds: response.data.notFoundIds,
  };
}

function appendProductImages(formData: FormData, images: ProductImageFormItem[]): void {
  images.forEach((image, index) => {
    const hasFile = image.file instanceof File;
    if (!image.id && !hasFile) {
      return;
    }

    const prefix = `images[${index}]`;
    if (image.id) {
      formData.append(`${prefix}[id]`, String(image.id));
    }
    if (hasFile) {
      formData.append(`${prefix}[image]`, image.file as File);
    }
    appendBoolean(formData, `${prefix}[featured]`, image.featured);
  });
}

function appendVariantImages(
  formData: FormData,
  variantPrefix: string,
  images: ProductImageFormItem[],
): void {
  images.forEach((image, index) => {
    if (!image.id && !(image.file instanceof File)) {
      return;
    }

    const prefix = `${variantPrefix}[images][${index}]`;
    if (image.id) {
      formData.append(`${prefix}[id]`, String(image.id));
    }
    if (image.file instanceof File) {
      formData.append(`${prefix}[image]`, image.file);
    }
    appendBoolean(formData, `${prefix}[featured]`, image.featured);
  });
}

type BuildProductFormDataOptions = {
  /** When true, empty strings/arrays that are present in the payload are sent (partial updates). */
  allowEmptyValues?: boolean;
};

type DiscountFormFields = {
  hasDiscountPrice?: boolean;
  priceDiscount?: number | null;
  priceDiscountPercentage?: string | null;
  discountStartAt?: string;
  discountExpireAt?: string;
};

function fieldKey(name: string, prefix?: string): string {
  return prefix ? `${prefix}[${name}]` : name;
}

/**
 * Laravel decimal/datetime casts reject empty strings. Turning a discount off
 * must send `price_discount=0` (multipart cannot send null).
 */
function appendDiscountFields(
  formData: FormData,
  data: DiscountFormFields,
  options: { allowEmptyValues?: boolean; prefix?: string; includeHasDiscountFlag?: boolean } = {},
): void {
  const { allowEmptyValues = false, prefix, includeHasDiscountFlag = true } = options;

  if (includeHasDiscountFlag && data.hasDiscountPrice !== undefined) {
    appendBoolean(formData, fieldKey("has_discount_price", prefix), data.hasDiscountPrice);
  }

  if (data.hasDiscountPrice === false) {
    formData.append(fieldKey("price_discount", prefix), "0");
    appendOptional(formData, fieldKey("price_discount_percentage", prefix), "", {
      allowEmpty: true,
    });
    return;
  }

  if (data.priceDiscount !== undefined) {
    appendOptionalDecimal(formData, fieldKey("price_discount", prefix), data.priceDiscount, {
      allowEmpty: allowEmptyValues,
    });
  }
  if (data.priceDiscountPercentage !== undefined) {
    appendOptional(
      formData,
      fieldKey("price_discount_percentage", prefix),
      data.priceDiscountPercentage ?? "",
      { allowEmpty: allowEmptyValues },
    );
  }
  if (data.discountStartAt !== undefined) {
    appendOptional(
      formData,
      fieldKey("discount_start_at", prefix),
      fromDatetimeLocalValue(data.discountStartAt),
    );
  }
  if (data.discountExpireAt !== undefined) {
    appendOptional(
      formData,
      fieldKey("discount_expire_at", prefix),
      fromDatetimeLocalValue(data.discountExpireAt),
    );
  }
}

function appendProductVariants(
  formData: FormData,
  variants: Array<Partial<ProductVariantFormItem>>,
  options: BuildProductFormDataOptions = {},
): void {
  const { allowEmptyValues = false } = options;

  variants.forEach((variant, index) => {
    const prefix = `variants[${index}]`;

    if (variant.id) {
      formData.append(`${prefix}[id]`, String(variant.id));
    }
    if (variant.price !== undefined) {
      appendOptional(formData, `${prefix}[price]`, variant.price);
    }
    if (variant.stock !== undefined) {
      appendOptional(formData, `${prefix}[stock]`, variant.stock);
    }
    if (variant.skuCode !== undefined) {
      appendOptional(formData, `${prefix}[sku_code]`, variant.skuCode, {
        allowEmpty: allowEmptyValues,
      });
    }
    if (variant.eanCode !== undefined) {
      appendOptional(formData, `${prefix}[ean_code]`, variant.eanCode, {
        allowEmpty: allowEmptyValues,
      });
    }
    appendDiscountFields(formData, variant, {
      allowEmptyValues,
      prefix,
    });

    if (variant.attributeIds !== undefined) {
      appendNumberArray(
        formData,
        `${prefix}[attributeIds]`,
        uniqueNumberIds(variant.attributeIds),
        "bracket",
        { allowEmpty: allowEmptyValues },
      );
    }
    if (variant.attributeValueIds !== undefined) {
      appendNumberArray(
        formData,
        `${prefix}[attributeValueIds]`,
        uniqueNumberIds(variant.attributeValueIds),
        "bracket",
        { allowEmpty: allowEmptyValues },
      );
    }

    if (variant.images) {
      appendVariantImages(formData, prefix, variant.images);
    }

    if (variant.deletedImageIds?.length) {
      appendNumberArray(formData, `${prefix}[deleted_image_ids]`, variant.deletedImageIds);
    }
  });
}

function resolveProductType(data: Partial<ProductFormData>): ProductType | undefined {
  return data.type;
}

function buildProductFormData(
  data: Partial<ProductFormData>,
  options: BuildProductFormDataOptions = {},
): FormData {
  const formData = new FormData();
  const productType = resolveProductType(data);
  const { allowEmptyValues = false } = options;

  if (data.brandId != null) {
    formData.append("brand_id", String(data.brandId));
  }

  if (data.categoryIds) {
    appendNumberArray(formData, "category_ids", data.categoryIds);
  }

  if (data.tagIds) {
    appendNumberArray(formData, "tag_ids", data.tagIds);
  }

  if (productType) {
    formData.append("type", productType);
  }

  if (data.translations) {
    appendProductTranslations(formData, data.translations, {
      allowEmpty: allowEmptyValues,
    });
  }

  appendBoolean(formData, "publish", data.publish);
  appendBoolean(formData, "approve_add_to_care_plan", data.approveAddToCarePlan);
  appendBoolean(formData, "has_discount_price", data.hasDiscountPrice);
  appendBoolean(formData, "best_seller", data.bestSeller);
  appendBoolean(formData, "newly_arrived", data.newlyArrived);
  appendBoolean(formData, "featured", data.featured);
  appendBoolean(formData, "is_product_you_will_love", data.isProductYouWillLove);

  if (data.expiryStartDate !== undefined) {
    appendOptional(formData, "expiry_start_date", data.expiryStartDate, {
      allowEmpty: allowEmptyValues,
    });
  }
  if (data.expiryEndDate !== undefined) {
    appendOptional(formData, "expiry_end_date", data.expiryEndDate, {
      allowEmpty: allowEmptyValues,
    });
  }

  // Partial updates often omit `type`. Infer SIMPLE only when variant payload is absent.
  const isSimpleProduct =
    productType === "SIMPLE" ||
    (productType === undefined &&
      data.variants === undefined &&
      (data.deletedVariantIds?.length ?? 0) === 0 &&
      (data.attributeIds !== undefined ||
        data.attributeValueIds !== undefined ||
        data.skuCode !== undefined ||
        data.eanCode !== undefined ||
        data.price !== undefined ||
        data.hasDiscountPrice !== undefined ||
        data.priceDiscount !== undefined ||
        data.priceDiscountPercentage !== undefined ||
        data.discountStartAt !== undefined ||
        data.discountExpireAt !== undefined ||
        data.stock !== undefined));

  if (isSimpleProduct) {
    if (data.skuCode !== undefined) {
      appendOptional(formData, "sku_code", data.skuCode, { allowEmpty: allowEmptyValues });
    }
    if (data.eanCode !== undefined) {
      appendOptional(formData, "ean_code", data.eanCode, { allowEmpty: allowEmptyValues });
    }
    if (data.price !== undefined) {
      appendOptional(formData, "price", data.price);
    }
    appendDiscountFields(formData, data, {
      allowEmptyValues,
      includeHasDiscountFlag: false,
    });
    if (data.stock !== undefined) {
      appendOptional(formData, "stock", data.stock);
    }

    // OpenAPI form-data: attributeIds[], attributeValueIds[]
    if (data.attributeIds !== undefined) {
      appendNumberArray(formData, "attributeIds", data.attributeIds, "bracket", {
        allowEmpty: allowEmptyValues,
      });
    }
    if (data.attributeValueIds !== undefined) {
      appendNumberArray(formData, "attributeValueIds", data.attributeValueIds, "bracket", {
        allowEmpty: allowEmptyValues,
      });
    }
  }

  // Partial updates often omit `type`. Still append VARIABLE_PRODUCT fields when they are present.
  const isVariantProduct =
    productType === "VARIABLE_PRODUCT" ||
    (productType === undefined &&
      (data.variants !== undefined || (data.deletedVariantIds?.length ?? 0) > 0));

  if (isVariantProduct) {
    if (data.variants) {
      appendProductVariants(formData, data.variants, options);
    }
  }

  if (data.video instanceof File) {
    appendFile(formData, "video", data.video);
  }

  if (data.metaFeatureImage instanceof File) {
    appendFile(formData, "meta_feature_image", data.metaFeatureImage);
  }

  if (data.images) {
    appendProductImages(formData, data.images);
  }

  if (data.deletedImageIds?.length) {
    appendNumberArray(formData, "deleted_image_ids", data.deletedImageIds);
  }

  if (isVariantProduct && data.deletedVariantIds?.length) {
    appendNumberArray(formData, "deleted_variant_ids", data.deletedVariantIds);
  }

  return formData;
}

/**
 * Sync variant create/update/delete through AdminProductVariant endpoints
 * (`/admin/products/{product}/product-variants`) instead of embedding them
 * in the product multipart payload.
 */
async function syncProductVariantsViaDedicatedApi(
  productId: number,
  variants: Array<Partial<ProductVariantFormItem>> = [],
  deletedVariantIds: number[] = [],
): Promise<void> {
  for (const variantId of deletedVariantIds) {
    await productVariantsService.delete(productId, variantId);
  }

  for (const variant of variants) {
    if (variant.id) {
      const changes = { ...variant };
      delete changes.id;
      await productVariantsService.update(productId, variant.id, changes);
      continue;
    }

    await productVariantsService.create(productId, variant as ProductVariantFormItem);
  }
}

function hasProductPayloadFields(data: Partial<ProductFormData>): boolean {
  return Object.entries(data).some(([key, value]) => {
    if (key === "variants" || key === "deletedVariantIds") return false;
    if (value === undefined) return false;
    if (Array.isArray(value) && value.length === 0) {
      return key === "deletedImageIds" || key === "categoryIds" || key === "tagIds";
    }
    return true;
  });
}

const PRODUCT_BULK_BOOLEAN_FORM_KEYS = {
  publish: "publish",
  featured: "featured",
  bestSeller: "best_seller",
  newlyArrived: "newly_arrived",
  isProductYouWillLove: "is_product_you_will_love",
  approveAddToCarePlan: "approve_add_to_care_plan",
} as const satisfies Record<string, string>;

function appendBulkDiscountFields(
  formData: FormData,
  prefix: string,
  entry: Pick<
    ProductBulkUpdateEntry,
    "hasDiscountPrice" | "priceDiscount" | "priceDiscountPercentage"
  >,
): void {
  appendBoolean(formData, `${prefix}[has_discount_price]`, entry.hasDiscountPrice);
  if (entry.priceDiscount !== undefined) {
    appendOptionalDecimal(formData, `${prefix}[price_discount]`, entry.priceDiscount, {
      allowEmpty: true,
    });
  }
  if (entry.priceDiscountPercentage !== undefined) {
    appendOptional(formData, `${prefix}[price_discount_percentage]`, entry.priceDiscountPercentage, {
      allowEmpty: true,
    });
  }
}

function appendBulkVariantFields(
  formData: FormData,
  prefix: string,
  variants: ProductBulkUpdateVariantEntry[],
): void {
  variants.forEach((variant, index) => {
    const variantPrefix = `${prefix}[variants][${index}]`;
    formData.append(`${variantPrefix}[id]`, String(variant.id));
    if (variant.price !== undefined) {
      appendOptional(formData, `${variantPrefix}[price]`, variant.price);
    }
    appendBulkDiscountFields(formData, variantPrefix, variant);
  });
}

function buildBulkProductUpdateFormData(entries: ProductBulkUpdateEntry[]): FormData {
  const formData = new FormData();

  entries.forEach((entry, index) => {
    const prefix = `products[${index}]`;
    formData.append(`${prefix}[id]`, String(entry.id));

    (Object.keys(PRODUCT_BULK_BOOLEAN_FORM_KEYS) as Array<
      keyof typeof PRODUCT_BULK_BOOLEAN_FORM_KEYS
    >).forEach((field) => {
      const value = entry[field];
      if (typeof value === "boolean") {
        appendBoolean(formData, `${prefix}[${PRODUCT_BULK_BOOLEAN_FORM_KEYS[field]}]`, value);
      }
    });

    if (entry.price !== undefined) {
      appendOptional(formData, `${prefix}[price]`, entry.price);
    }
    appendBulkDiscountFields(formData, prefix, entry);

    if (entry.variants?.length) {
      appendBulkVariantFields(formData, prefix, entry.variants);
    }
  });

  return formData;
}

function createApiProductsService(): ProductsService {
  async function getById(id: number, signal?: AbortSignal): Promise<Product> {
    const response = await apiRequest<LaravelSuccessResponse<Product>>(`/admin/products/${id}`, {
      signal,
    });
    return mapProductFromApi(response.data);
  }

  async function getBySlug(slug: string): Promise<Product> {
    const response = await apiRequest<LaravelSuccessResponse<Product>>(`/products/slug/${slug}`, {
      skipAuth: false,
    });
    return mapProductFromApi(response.data);
  }

  async function resolveRouteKey(routeKey: string, signal?: AbortSignal): Promise<Product> {
    const decoded = decodeAdminRouteKey(routeKey) ?? routeKey.trim();
    if (!decoded) {
      throw new ServiceError("not_found");
    }
    if (isNumericAdminRouteKey(decoded)) {
      return getById(Number(decoded), signal);
    }

    // Slug URLs must still hydrate through the admin show endpoint so translations
    // (including the English slug used for routing) stay stable in every locale.
    const matched = await getBySlug(decoded);
    return getById(matched.id, signal);
  }

  return {
    async list(params: ProductListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Product>>("/admin/products", {
        signal,
        params: buildProductListQueryParams(params),
      });
      return mapPaginatedFromApi(response, mapProductFromApi);
    },

    async listTrashed(params: ProductListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Product>>(
        "/admin/products/trashed",
        {
          signal,
          params: buildProductListQueryParams(params),
        },
      );
      return mapPaginatedFromApi(response, mapProductFromApi);
    },

    getById,

    getBySlug,

    resolveRouteKey,

    async create(data: ProductFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Product>>("/admin/products", {
        method: "POST",
        body: buildProductFormData(data),
      });

      return mapProductFromApi(response.data);
    },

    async update(id, data: Partial<ProductFormData>, context?: { type?: ProductType }) {
      const currentType = context?.type ?? data.type;
      const nextType = data.type ?? currentType;
      const isConvertingSimpleToVariable =
        currentType === "SIMPLE" && nextType === "VARIABLE_PRODUCT";

      const variants = data.variants;
      const deletedVariantIds = data.deletedVariantIds;
      const hasVariantOps =
        (variants !== undefined && variants.length > 0) ||
        (deletedVariantIds !== undefined && deletedVariantIds.length > 0);

      // SIMPLE → VARIABLE still uses product update so the backend can migrate
      // simple-level inventory into the first variant.
      if (isConvertingSimpleToVariable) {
        const formData = buildProductFormData(data, { allowEmptyValues: true });
        const { method, body } = submitMultipartFormData(formData, "PUT");
        const response = await apiRequest<LaravelSuccessResponse<Product>>(
          `/admin/products/${id}`,
          { method, body },
        );
        return mapProductFromApi(response.data);
      }

      const productPayload: Partial<ProductFormData> = { ...data };
      delete productPayload.variants;
      delete productPayload.deletedVariantIds;

      let updated: Product | null = null;
      if (hasProductPayloadFields(productPayload)) {
        const formData = buildProductFormData(productPayload, { allowEmptyValues: true });
        const { method, body } = submitMultipartFormData(formData, "PUT");
        const response = await apiRequest<LaravelSuccessResponse<Product>>(`/admin/products/${id}`, {
          method,
          body,
        });
        updated = mapProductFromApi(response.data);
      }

      if (hasVariantOps && nextType !== "SIMPLE") {
        await syncProductVariantsViaDedicatedApi(id, variants ?? [], deletedVariantIds ?? []);
        return getById(id);
      }

      if (updated) {
        return updated;
      }

      return getById(id);
    },

    async delete(id) {
      await apiRequest(`/admin/products/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/products/bulk-delete", ids);
    },

    async restore(id) {
      const response = await apiRequest<LaravelSuccessResponse<Product>>(
        `/admin/products/${id}/restore`,
        { method: "POST" },
      );
      return mapProductFromApi(response.data);
    },

    async bulkRestore(ids) {
      return postProductTrashBulk("/admin/products/bulk-restore", ids);
    },

    async forceDelete(id) {
      await apiRequest(`/admin/products/${id}/force`, { method: "DELETE" });
    },

    async bulkForceDelete(ids) {
      return postProductTrashBulk("/admin/products/bulk-force-delete", ids);
    },

    async bulkUpdate(entries: ProductBulkUpdateEntry[]) {
      if (entries.length === 0) {
        return [];
      }

      const response = await apiRequest<LaravelSuccessResponse<Product[]>>(
        "/admin/products/bulk-update",
        {
          method: "POST",
          body: buildBulkProductUpdateFormData(entries),
          timeoutMs: 120_000,
        },
      );

      return (Array.isArray(response.data) ? response.data : []).map(mapProductFromApi);
    },

    async bulkAdjustPrice(input: ProductBulkAdjustPriceInput) {
      const ids = toBulkDeleteIds(input.ids);
      if (ids.length === 0) {
        return { updatedCount: 0, updated: [], skippedIds: [], notFoundIds: [] };
      }

      const response = await apiRequest<LaravelSuccessResponse<ProductBulkAdjustPriceResult>>(
        "/admin/products/bulk-adjust-price",
        {
          method: "POST",
          body: {
            ids,
            direction: input.direction,
            mode: input.mode,
            value: input.value,
          },
          timeoutMs: 120_000,
        },
      );

      const data = response.data;
      return {
        updatedCount: data.updatedCount,
        updated: data.updated ?? [],
        skippedIds: data.skippedIds ?? [],
        notFoundIds: data.notFoundIds ?? [],
      };
    },

    async importFromCsv(file: File): Promise<ProductImportSummary> {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiRequest<LaravelSuccessResponse<ProductImportSummary>>(
        "/admin/products/import",
        {
          method: "POST",
          body: formData,
          timeoutMs: PRODUCT_IMPORT_REQUEST_TIMEOUT_MS,
        },
      );

      return mapProductImportFromApi(response.data);
    },
  };
}

export { buildProductFormData, createApiProductsService };
