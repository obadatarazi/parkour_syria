import { Download, FileSpreadsheet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BrandMultiPicker } from "@/features/coupons/components/BrandMultiPicker";
import { CategoryMultiPicker } from "@/features/products/components/CategoryMultiPicker";
import { AppButton, SelectField } from "@/shared/components";
import { CRUD_FILTER_ALL_VALUE, CrudEntityDialog, useCrudQuery } from "@/shared/crud";
import { Checkbox } from "@/shared/design-system/components/ui/checkbox";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { fetchEnumOptions, OPTIONS_ENDPOINTS } from "@/shared/lib/api";
import {
  type CsvExportParams,
  downloadCsvExport,
} from "@/shared/lib/api/csv-export";
import { notify } from "@/shared/lib/notifications";

const PRODUCT_EXPORT_PATH = "/admin/products/export";
const COLUMN_OPTIONS_STALE_TIME_MS = 30 * 60 * 1000;

export type ProductExportScope = "all" | "list" | "custom";
export type ProductExportColumnsMode = "all" | "selected";

export type ProductExportListFilters = {
  search?: string;
  publish?: boolean;
  brandId?: number | string;
  categoryId?: number | string;
  type?: string;
  tagId?: number | string;
  featured?: boolean;
  bestSeller?: boolean;
  newlyArrived?: boolean;
  isProductYouWillLove?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

type ProductExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Active products-list filters (search + toolbar filters). Used when scope is `list`. */
  listFilters: ProductExportListFilters;
  hasActiveListFilters: boolean;
};

function buildExportParams(input: {
  scope: ProductExportScope;
  listFilters: ProductExportListFilters;
  publish: string;
  brandIds: number[];
  categoryIds: number[];
  type: string;
  columnsMode: ProductExportColumnsMode;
  selectedColumns: string[];
}): CsvExportParams {
  const params: CsvExportParams = {};

  if (input.scope === "list") {
    Object.assign(params, input.listFilters);
  } else if (input.scope === "custom") {
    if (input.publish !== CRUD_FILTER_ALL_VALUE) {
      params.publish = input.publish === "true";
    }
    if (input.brandIds.length > 0) {
      params.brandId = input.brandIds.join(",");
    }
    if (input.categoryIds.length > 0) {
      params.categoryId = input.categoryIds.join(",");
    }
    if (input.type !== CRUD_FILTER_ALL_VALUE) {
      params.type = input.type;
    }
  }

  if (input.columnsMode === "selected" && input.selectedColumns.length > 0) {
    params.attributes = input.selectedColumns.join(",");
  }

  return params;
}

export function ProductExportDialog({
  open,
  onOpenChange,
  listFilters,
  hasActiveListFilters,
}: ProductExportDialogProps) {
  const t = useTranslation();

  const columnsQuery = useCrudQuery({
    queryKey: ["options", "products", "export-attributes"],
    queryFn: (signal) => fetchEnumOptions(OPTIONS_ENDPOINTS.productExportAttributes, signal),
    staleTime: COLUMN_OPTIONS_STALE_TIME_MS,
    enabled: open,
  });

  const [scope, setScope] = useState<ProductExportScope>("all");
  const [publish, setPublish] = useState(CRUD_FILTER_ALL_VALUE);
  const [brandIds, setBrandIds] = useState<number[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [type, setType] = useState(CRUD_FILTER_ALL_VALUE);
  const [columnsMode, setColumnsMode] = useState<ProductExportColumnsMode>("all");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [columnsError, setColumnsError] = useState<string | undefined>();

  const columnOptions = columnsQuery.data ?? [];

  const scopeOptions = useMemo(
    () => [
      { value: "all", label: t.productExportScopeAll },
      {
        value: "list",
        label: hasActiveListFilters
          ? t.productExportScopeListFiltered
          : t.productExportScopeList,
      },
      { value: "custom", label: t.productExportScopeCustom },
    ],
    [hasActiveListFilters, t],
  );

  const publishOptions = useMemo(
    () => [
      { value: CRUD_FILTER_ALL_VALUE, label: t.filterAll },
      { value: "true", label: t.active },
      { value: "false", label: t.inactive },
    ],
    [t],
  );

  const typeOptions = useMemo(
    () => [
      { value: CRUD_FILTER_ALL_VALUE, label: t.filterAll },
      { value: "SIMPLE", label: t.productTypeSimple },
      { value: "VARIABLE_PRODUCT", label: t.productTypeVariant },
    ],
    [t],
  );

  const columnsModeOptions = useMemo(
    () => [
      { value: "all", label: t.productExportColumnsAll },
      { value: "selected", label: t.productExportColumnsSelected },
    ],
    [t],
  );

  useEffect(() => {
    if (!open) {
      setScope(hasActiveListFilters ? "list" : "all");
      setPublish(CRUD_FILTER_ALL_VALUE);
      setBrandIds([]);
      setCategoryIds([]);
      setType(CRUD_FILTER_ALL_VALUE);
      setColumnsMode("all");
      setSelectedColumns([]);
      setColumnsError(undefined);
      setIsExporting(false);
    }
  }, [hasActiveListFilters, open]);

  useEffect(() => {
    if (!open || columnsMode !== "selected" || selectedColumns.length > 0) return;
    if (columnOptions.length === 0) return;
    const preferred = ["id", "title", "type", "brand", "sku_code", "price", "stock", "publish"];
    const available = new Set(columnOptions.map((option) => option.value));
    const defaults = preferred.filter((value) => available.has(value));
    setSelectedColumns(defaults.length > 0 ? defaults : columnOptions.slice(0, 8).map((o) => o.value));
  }, [columnOptions, columnsMode, open, selectedColumns.length]);

  const toggleColumn = (value: string) => {
    setColumnsError(undefined);
    setSelectedColumns((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const selectAllColumns = () => {
    setColumnsError(undefined);
    setSelectedColumns(columnOptions.map((option) => option.value));
  };

  const clearColumns = () => {
    setSelectedColumns([]);
  };

  const handleExport = async () => {
    if (columnsMode === "selected" && selectedColumns.length === 0) {
      setColumnsError(t.productExportColumnsRequired);
      return;
    }

    setIsExporting(true);
    const toastId = notify.loading(t.exportCsvLoading);

    try {
      const params = buildExportParams({
        scope,
        listFilters,
        publish,
        brandIds,
        categoryIds,
        type,
        columnsMode,
        selectedColumns,
      });

      await downloadCsvExport(PRODUCT_EXPORT_PATH, params);
      notify.success(t.successMessage, t.exportCsvSuccess, { id: toastId });
      onOpenChange(false);
    } catch (caught) {
      const error = caught instanceof Error ? caught : new Error(String(caught ?? "Request failed"));
      notify.error(t.errorMessage, resolveServiceErrorMessage(error, t), { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <CrudEntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.productExportTitle}
      description={t.productExportDescription}
      size="lg"
      isLoading={isExporting}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AppButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            {t.cancel}
          </AppButton>
          <AppButton type="button" onClick={() => void handleExport()} isLoading={isExporting}>
            <Download className="size-4" aria-hidden="true" />
            {t.productExportDownload}
          </AppButton>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-sm text-blue-950">
          <FileSpreadsheet className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium">{t.productExportHintTitle}</p>
            <p className="text-[13px] leading-relaxed opacity-90">{t.productExportHintDescription}</p>
          </div>
        </div>

        <SelectField
          label={t.productExportScopeLabel}
          value={scope}
          options={scopeOptions}
          helperText={t.productExportScopeHint}
          onValueChange={(value) => setScope(value as ProductExportScope)}
          disabled={isExporting}
        />

        {scope === "custom" ? (
          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label={t.status}
                value={publish}
                options={publishOptions}
                onValueChange={setPublish}
                disabled={isExporting}
              />
              <SelectField
                label={t.productType}
                value={type}
                options={typeOptions}
                onValueChange={setType}
                disabled={isExporting}
              />
            </div>

            <p className="text-sm text-muted-foreground">{t.productExportMultiFilterHint}</p>

            <BrandMultiPicker
              value={brandIds}
              onChange={setBrandIds}
              disabled={isExporting}
              required={false}
            />
            <CategoryMultiPicker
              value={categoryIds}
              onChange={setCategoryIds}
              disabled={isExporting}
              required={false}
            />
          </div>
        ) : null}

        {scope === "list" && hasActiveListFilters ? (
          <p className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            {t.productExportListFiltersHint}
          </p>
        ) : null}

        <SelectField
          label={t.productExportColumnsLabel}
          value={columnsMode}
          options={columnsModeOptions}
          helperText={t.productExportColumnsHint}
          onValueChange={(value) => {
            setColumnsMode(value as ProductExportColumnsMode);
            setColumnsError(undefined);
          }}
          disabled={isExporting}
        />

        {columnsMode === "selected" ? (
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                {t.productExportColumnsSelectedCount.replace(
                  "{count}",
                  String(selectedColumns.length),
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                <AppButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllColumns}
                  disabled={isExporting || columnOptions.length === 0}
                >
                  {t.selectAllRows}
                </AppButton>
                <AppButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearColumns}
                  disabled={isExporting || selectedColumns.length === 0}
                >
                  {t.clearFilters}
                </AppButton>
              </div>
            </div>

            {columnsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">{t.exportCsvLoading}</p>
            ) : null}

            {columnsQuery.isError ? (
              <p className="text-sm text-destructive">{t.productExportColumnsLoadError}</p>
            ) : null}

            {columnsError ? <p className="text-sm text-destructive">{columnsError}</p> : null}

            <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
              {columnOptions.map((option) => {
                const checked = selectedColumns.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 text-sm hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={checked}
                      disabled={isExporting}
                      onCheckedChange={() => toggleColumn(option.value)}
                      aria-label={option.label}
                    />
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground">{option.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {option.value}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </CrudEntityDialog>
  );
}
