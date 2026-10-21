import type { ProductVariantsService } from "@/features/products/services/product-variants.service.types";
import type {
  ProductImageFormItem,
  ProductVariant,
  ProductVariantFormItem,
} from "@/features/products/types/products.types";
import { fromDatetimeLocalValue } from "@/features/products/types/products.types";
import { mapProductVariantFromApi } from "@/features/products/utils/map-product-from-api";
import { uniqueNumberIds } from "@/features/products/utils/variant-attribute.utils";
import {
  apiRequest,
  appendBoolean,
  appendNumberArray,
  appendOptional,
  appendOptionalDecimal,
  type LaravelSuccessResponse,
  submitMultipartFormData,
} from "@/shared/lib/api";

type BuildVariantFormDataOptions = {
  allowEmptyValues?: boolean;
  /** Create requires a File on every image row; update may keep existing ids. */
  requireImageFiles?: boolean;
};

function appendVariantImages(
  formData: FormData,
  images: ProductImageFormItem[],
  options: BuildVariantFormDataOptions,
): void {
  const { requireImageFiles = false } = options;
  let imageIndex = 0;

  images.forEach((image) => {
    const hasFile = image.file instanceof File;
    if (requireImageFiles && !hasFile) {
      return;
    }
    if (!image.id && !hasFile) {
      return;
    }

    const prefix = `images[${imageIndex}]`;
    imageIndex += 1;

    if (image.id) {
      formData.append(`${prefix}[id]`, String(image.id));
    }
    if (hasFile) {
      formData.append(`${prefix}[image]`, image.file as File);
    }
    appendBoolean(formData, `${prefix}[featured]`, image.featured);
  });
}

function buildVariantFormData(
  data: Partial<ProductVariantFormItem>,
  options: BuildVariantFormDataOptions = {},
): FormData {
  const formData = new FormData();
  const { allowEmptyValues = false } = options;

  if (data.price !== undefined) {
    appendOptional(formData, "price", data.price);
  }
  if (data.stock !== undefined) {
    appendOptional(formData, "stock", data.stock);
  }
  if (data.skuCode !== undefined) {
    appendOptional(formData, "sku_code", data.skuCode, { allowEmpty: allowEmptyValues });
  }
  if (data.eanCode !== undefined) {
    appendOptional(formData, "ean_code", data.eanCode, { allowEmpty: allowEmptyValues });
  }
  if (data.hasDiscountPrice !== undefined) {
    appendBoolean(formData, "has_discount_price", data.hasDiscountPrice);
  }
  if (data.hasDiscountPrice === false) {
    formData.append("price_discount", "0");
    appendOptional(formData, "price_discount_percentage", "", { allowEmpty: true });
  } else {
    if (data.priceDiscount !== undefined) {
      appendOptionalDecimal(formData, "price_discount", data.priceDiscount, {
        allowEmpty: allowEmptyValues,
      });
    }
    if (data.priceDiscountPercentage !== undefined) {
      appendOptional(formData, "price_discount_percentage", data.priceDiscountPercentage ?? "", {
        allowEmpty: allowEmptyValues,
      });
    }
    if (data.discountStartAt !== undefined) {
      appendOptional(formData, "discount_start_at", fromDatetimeLocalValue(data.discountStartAt));
    }
    if (data.discountExpireAt !== undefined) {
      appendOptional(formData, "discount_expire_at", fromDatetimeLocalValue(data.discountExpireAt));
    }
  }

  if (data.attributeIds !== undefined) {
    appendNumberArray(formData, "attributeIds", uniqueNumberIds(data.attributeIds), "bracket", {
      allowEmpty: allowEmptyValues,
    });
  }
  if (data.attributeValueIds !== undefined) {
    appendNumberArray(
      formData,
      "attributeValueIds",
      uniqueNumberIds(data.attributeValueIds),
      "bracket",
      { allowEmpty: allowEmptyValues },
    );
  }

  if (data.images) {
    appendVariantImages(formData, data.images, options);
  }

  if (data.deletedImageIds?.length) {
    appendNumberArray(formData, "deleted_image_ids", data.deletedImageIds);
  }

  return formData;
}

function createApiProductVariantsService(): ProductVariantsService {
  const basePath = (productId: number) => `/admin/products/${productId}/product-variants`;

  return {
    async create(productId, data) {
      const response = await apiRequest<LaravelSuccessResponse<ProductVariant>>(basePath(productId), {
        method: "POST",
        body: buildVariantFormData(data, { requireImageFiles: true }),
      });
      return mapProductVariantFromApi(response.data);
    },

    async update(productId, variantId, data) {
      const formData = buildVariantFormData(data, { allowEmptyValues: true });
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<ProductVariant>>(
        `${basePath(productId)}/${variantId}`,
        { method, body },
      );
      return mapProductVariantFromApi(response.data);
    },

    async delete(productId, variantId) {
      await apiRequest(`${basePath(productId)}/${variantId}`, { method: "DELETE" });
    },
  };
}

export { buildVariantFormData, createApiProductVariantsService };
