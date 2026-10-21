export { type ApiBlobResult, apiRequest, type ApiRequestOptions, DEFAULT_API_REQUEST_TIMEOUT_MS } from "@/shared/lib/api/api-client";
export {
  type ApiLocale,
  getActiveApiLocale,
  resolveApiLocale,
  setActiveApiLocale,
} from "@/shared/lib/api/api-locale";
export {
  BULK_DELETE_MAX_IDS,
  type BulkDeleteApiResult,
  postBulkDelete,
  toBulkDeleteIds,
} from "@/shared/lib/api/bulk-delete";
export {
  CSV_EXPORT_TIMEOUT_MS,
  type CsvExportParams,
  downloadCsvExport,
} from "@/shared/lib/api/csv-export";
export {
  appendBoolean,
  appendFile,
  appendNumberArray,
  appendOptional,
  appendOptionalDecimal,
  appendProductTranslations,
  appendTranslations,
  type LocaleCode,
  type ProductTranslationInput,
  type ProductTranslationsInput,
  submitMultipartFormData,
  type TranslationInput,
  type TranslationsInput,
} from "@/shared/lib/api/form-data.utils";
export type {
  ApiLoginData,
  ApiProfileData,
  ApiRoleData,
  ApiUser,
  LaravelEnumOption,
  LaravelErrorResponse,
  LaravelPaginatedResponse,
  LaravelSuccessResponse,
} from "@/shared/lib/api/laravel.types";
export { buildLaravelExportParams, buildLaravelListParams, buildQueryString, mapLaravelError, mapLaravelPagination } from "@/shared/lib/api/laravel.utils";
export { mapPaginatedFromApi } from "@/shared/lib/api/map-paginated-from-api.utils";
export {
  mapPaginatedTranslatableFromApi,
  mapTranslatableFromApi,
  mapTranslatableListFromApi,
} from "@/shared/lib/api/map-translatable-from-api.utils";
export {
  type EnumLabelValue as ApiEnumLabelValue,
  enumLabel,
  enumValue,
  normalizeEnumLabelValue,
} from "@/shared/lib/api/normalize-enum.utils";
export {
  type LocaleCode as ApiLocaleCode,
  type ApiTranslationRow,
  getTitleFromApiTranslations,
  type LocaleTranslations,
  normalizeTranslationsFromApi,
} from "@/shared/lib/api/normalize-translations.utils";
export type { OptionsEndpoint } from "@/shared/services/options-api.service";
export { fetchEnumOptions, OPTIONS_ENDPOINTS } from "@/shared/services/options-api.service";
