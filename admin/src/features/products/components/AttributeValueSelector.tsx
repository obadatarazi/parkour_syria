import { ChevronDown, Info, Plus, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

import { CreateAttributeValueDialog } from "@/features/attributes/components/CreateAttributeValueDialog";
import { CreateAttributeWithValuesDialog } from "@/features/attributes/components/CreateAttributeWithValuesDialog";
import { attributesService } from "@/features/attributes/services/attributes.service";
import type {
  Attribute,
  AttributeValueSummary,
} from "@/features/attributes/types/attributes.types";
import { attributeValuesService } from "@/features/attribute-values/services/attribute-values.service";
import type { AttributeValue } from "@/features/attribute-values/types/attribute-values.types";
import { RelationPickerPanel } from "@/features/products/components/RelationPickerPanel";
import {
  buildAttributeSeedsFromPoolIds,
  mergeAttributeCatalog,
} from "@/features/products/utils/build-attribute-seeds-from-product";
import {
  Alert,
  AlertDescription,
  AppBadge,
  AppButton,
  FormField,
  SelectField,
} from "@/shared/components";
import { useCrudQuery } from "@/shared/crud";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { cn } from "@/shared/design-system/components/ui/utils";
import { resolveServiceErrorMessage } from "@/shared/errors";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

export type AttributeValueSelectionMode = "single" | "multi";

type AttributeValueSelectorProps = {
  attributeIds: number[];
  attributeValueIds: number[];
  onChange: (attributeIds: number[], attributeValueIds: number[]) => void;
  disabled?: boolean;
  error?: string;
  /** Single value per attribute (variants). Multi values per attribute (product attribute pool). */
  selectionMode?: AttributeValueSelectionMode;
  /** Limit which attributes appear (variant tab uses the configured pool). */
  allowedAttributeIds?: number[];
  /** Limit which values appear per attribute. */
  allowedAttributeValueIds?: number[];
  /** Product/edit seeds — used before catalog fetch completes. */
  seedAttributes?: Attribute[];
  /** Defer catalog fetch until tab/panel is active. */
  enabled?: boolean;
  /** Unique key per variant row — keeps dropdown state isolated across rows. */
  instanceKey?: string;
  label?: string;
  required?: boolean;
  /**
   * When true (typically Simple products), show an info alert on any attribute
   * that has more than one selected value, explaining Variable Product is required
   * for customer choice.
   */
  showVariableProductHint?: boolean;
  /** Allow creating catalog attributes/values via Attributes API from this selector. */
  allowCreateAttribute?: boolean;
};

function getAttributeLabel(attribute: Attribute): string {
  return formatBilingualLabel(getBilingualTitle(attribute.translations, attribute.title));
}

function getValueLabel(value: AttributeValueSummary): string {
  return formatBilingualLabel(getBilingualTitle(value.translations, value.title));
}

function toValueSummary(value: AttributeValue): AttributeValueSummary {
  return {
    id: value.id,
    title: value.title,
    translations: value.translations,
  };
}

function mergeValues(
  existing: AttributeValueSummary[] | undefined,
  incoming: AttributeValueSummary[],
): AttributeValueSummary[] {
  const byId = new Map((existing ?? []).map((value) => [value.id, value]));
  for (const value of incoming) {
    byId.set(value.id, value);
  }
  return [...byId.values()].sort((left, right) =>
    getValueLabel(left).localeCompare(getValueLabel(right)),
  );
}

function useAttributeValues(
  attributeId: number,
  seedValues: AttributeValueSummary[] | undefined,
  enabled: boolean,
) {
  const valuesQuery = useCrudQuery({
    queryKey: ["attribute-values", "selector", String(attributeId)],
    queryFn: async () => {
      const result = await attributeValuesService.list({
        attributeId,
        limit: 100,
        publish: true,
        sort: "id",
        direction: "asc",
      });
      return result.data.map(toValueSummary);
    },
    enabled: enabled && attributeId > 0,
  });

  const values = useMemo(
    () => mergeValues(seedValues, valuesQuery.data ?? []),
    [seedValues, valuesQuery.data],
  );

  return {
    values,
    isLoading: valuesQuery.isLoading && values.length === 0,
    isError: valuesQuery.isError,
    error: valuesQuery.error,
    refetch: valuesQuery.refetch,
    patchCreatedValue: (created: AttributeValue) => {
      valuesQuery.patchData((previous) => {
        const current = previous ?? [];
        if (current.some((value) => value.id === created.id)) return current;
        return mergeValues(current, [toValueSummary(created)]);
      });
    },
  };
}

type AttributeSingleSelectProps = {
  attribute: Attribute;
  attributeValueIds: number[];
  onSelect: (attributeId: number, valueId: number, knownValueIds: number[]) => void;
  disabled?: boolean;
  required?: boolean;
  allowedAttributeValueIds?: number[];
  selectInstanceKey: string;
  enabled: boolean;
};

function AttributeSingleSelect({
  attribute,
  attributeValueIds,
  onSelect,
  disabled = false,
  required = true,
  allowedAttributeValueIds,
  selectInstanceKey,
  enabled,
}: AttributeSingleSelectProps) {
  const t = useTranslation();
  const { values, isLoading } = useAttributeValues(attribute.id, attribute.values, enabled);

  const visibleValues = useMemo(() => {
    const allowedValueIdSet = allowedAttributeValueIds?.length
      ? new Set(allowedAttributeValueIds)
      : null;

    if (!allowedValueIdSet) return values;

    const poolValues = values.filter((value) => allowedValueIdSet.has(value.id));
    const selectedForAttribute = values.filter((value) => attributeValueIds.includes(value.id));
    const mergedById = new Map(poolValues.map((value) => [value.id, value]));
    for (const value of selectedForAttribute) {
      mergedById.set(value.id, value);
    }
    return [...mergedById.values()].sort((left, right) =>
      getValueLabel(left).localeCompare(getValueLabel(right)),
    );
  }, [allowedAttributeValueIds, attributeValueIds, values]);

  const selected = visibleValues.find((value) => attributeValueIds.includes(value.id));
  const knownValueIds = values.map((value) => value.id);

  return (
    <SelectField
      key={`${selectInstanceKey}-${attribute.id}`}
      label={getAttributeLabel(attribute)}
      value={selected ? String(selected.id) : ""}
      onValueChange={(valueId) => onSelect(attribute.id, Number(valueId), knownValueIds)}
      options={visibleValues.map((value) => ({
        value: String(value.id),
        label: getValueLabel(value),
      }))}
      placeholder={isLoading ? t.loadingMessage : t.selectAttributeValue}
      disabled={disabled || visibleValues.length === 0}
      required={required}
    />
  );
}

type SelectedAttributeCardProps = {
  attribute: Attribute;
  attributeValueIds: number[];
  disabled?: boolean;
  allowCreateAttribute?: boolean;
  showVariableProductHint?: boolean;
  enabled: boolean;
  onValuesLoaded: (attributeId: number, values: AttributeValueSummary[]) => void;
  onToggleValue: (attributeId: number, valueId: number, checked: boolean, knownValueIds: number[]) => void;
  onSelectAll: (attributeId: number, visibleValueIds: number[], knownValueIds: number[]) => void;
  onClearValues: (attributeId: number, knownValueIds: number[]) => void;
  onRemoveAttribute: (attributeId: number, knownValueIds: number[]) => void;
  onCreatedValue: (attributeId: number, createdValue: AttributeValue) => void;
};

function SelectedAttributeCard({
  attribute,
  attributeValueIds,
  disabled = false,
  allowCreateAttribute = false,
  showVariableProductHint = false,
  enabled,
  onValuesLoaded,
  onToggleValue,
  onSelectAll,
  onClearValues,
  onRemoveAttribute,
  onCreatedValue,
}: SelectedAttributeCardProps) {
  const t = useTranslation();
  const [valueSearch, setValueSearch] = useState("");
  const [addValueOpen, setAddValueOpen] = useState(false);
  const { values, isLoading, isError, error, refetch, patchCreatedValue } = useAttributeValues(
    attribute.id,
    attribute.values,
    enabled,
  );

  useEffect(() => {
    if (values.length > 0) {
      onValuesLoaded(attribute.id, values);
    }
  }, [attribute.id, onValuesLoaded, values]);

  const knownValueIds = values.map((value) => value.id);
  const selectedCount = values.filter((value) => attributeValueIds.includes(value.id)).length;

  const filteredValues = useMemo(() => {
    const needle = valueSearch.trim().toLowerCase();
    if (!needle) return values;
    return values.filter((value) => getValueLabel(value).toLowerCase().includes(needle));
  }, [valueSearch, values]);

  return (
    <div className="rounded-xl border border-border/70 bg-muted/10 p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{getAttributeLabel(attribute)}</p>
        <div className="flex flex-wrap items-center gap-3">
          {allowCreateAttribute ? (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              disabled={disabled}
              onClick={() => setAddValueOpen(true)}
            >
              {t.addAttributeValue}
            </button>
          ) : null}
          {filteredValues.length > 0 ? (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              disabled={disabled}
              onClick={() =>
                onSelectAll(
                  attribute.id,
                  filteredValues.map((value) => value.id),
                  knownValueIds,
                )
              }
            >
              {t.selectAllAttributeValues}
            </button>
          ) : null}
          {selectedCount > 0 ? (
            <button
              type="button"
              className="text-xs font-medium text-destructive hover:underline"
              disabled={disabled}
              onClick={() => onClearValues(attribute.id, knownValueIds)}
            >
              {t.clearAttributeValues}
            </button>
          ) : null}
          <button
            type="button"
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            disabled={disabled}
            onClick={() => onRemoveAttribute(attribute.id, knownValueIds)}
            aria-label={t.removeAttribute}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {values.length > 5 ? (
        <Input
          value={valueSearch}
          onChange={(event) => setValueSearch(event.target.value)}
          placeholder={t.searchAttributeValues}
          disabled={disabled}
        />
      ) : null}

      {isLoading ? (
        <p className="text-xs text-muted-foreground">{t.loadingMessage}</p>
      ) : isError ? (
        <div className="space-y-2">
          <p className="text-xs text-destructive">{resolveServiceErrorMessage(error, t)}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            {t.tryAgain}
          </Button>
        </div>
      ) : filteredValues.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t.noData}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filteredValues.map((value) => {
            const checked = attributeValueIds.includes(value.id);
            const title = getBilingualTitle(value.translations, value.title);
            return (
              <label
                key={value.id}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                  checked
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-border/80",
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={(event) =>
                    onToggleValue(attribute.id, value.id, event.target.checked, knownValueIds)
                  }
                  className="size-4 rounded border-border"
                />
                <span className="flex flex-wrap items-center gap-1.5">
                  {title.en ? <AppBadge label={title.en} variant="brand" /> : null}
                  {title.ar ? (
                    <span dir="rtl">
                      <AppBadge label={title.ar} variant="neutral" />
                    </span>
                  ) : null}
                  {!title.en && !title.ar ? getValueLabel(value) : null}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {selectedCount > 0 ? (
        <p className="text-xs text-muted-foreground">
          {t.selectedAttributeValuesCount.replace("{count}", String(selectedCount))}
        </p>
      ) : null}

      {showVariableProductHint && selectedCount > 1 ? (
        <Alert variant="info">
          <Info aria-hidden="true" />
          <AlertDescription>{t.attributeMultiValueVariableProductHint}</AlertDescription>
        </Alert>
      ) : null}

      {allowCreateAttribute ? (
        <CreateAttributeValueDialog
          open={addValueOpen}
          onOpenChange={setAddValueOpen}
          attributeId={attribute.id}
          attributeLabel={getAttributeLabel(attribute)}
          onCreated={(createdValue) => {
            patchCreatedValue(createdValue);
            onCreatedValue(attribute.id, createdValue);
          }}
        />
      ) : null}
    </div>
  );
}

export function AttributeValueSelector({
  attributeIds,
  attributeValueIds,
  onChange,
  disabled = false,
  error,
  selectionMode = "single",
  allowedAttributeIds,
  allowedAttributeValueIds,
  seedAttributes = [],
  enabled = true,
  instanceKey,
  label,
  required = true,
  showVariableProductHint = false,
  allowCreateAttribute = false,
}: AttributeValueSelectorProps) {
  const t = useTranslation();
  const fieldId = useId();
  const panelId = `${fieldId}-panel`;
  const selectInstanceKey = instanceKey ?? fieldId;
  const [isCreateAttributeOpen, setIsCreateAttributeOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [attributeSearch, setAttributeSearch] = useState("");
  const [pickedAttributes, setPickedAttributes] = useState<Attribute[]>([]);
  const [loadedValuesByAttributeId, setLoadedValuesByAttributeId] = useState<
    Record<number, AttributeValueSummary[]>
  >({});

  const attributesQuery = useCrudQuery({
    queryKey: ["attributes", "value-selector", "search", attributeSearch],
    queryFn: async () => {
      const result = await attributesService.list({
        limit: 20,
        search: attributeSearch.trim() || undefined,
        publish: true,
        sort: "id",
        direction: "asc",
      });
      return {
        ...result,
        data: [...result.data].sort((left, right) =>
          getAttributeLabel(left).localeCompare(getAttributeLabel(right)),
        ),
      };
    },
    enabled: enabled && selectionMode === "multi" && isPickerOpen,
  });

  const catalogQuery = useCrudQuery({
    queryKey: ["attributes", "value-selector", "catalog"],
    queryFn: async () => {
      const result = await attributesService.list({
        limit: 100,
        publish: true,
        sort: "id",
        direction: "asc",
      });
      return result;
    },
    enabled:
      enabled &&
      selectionMode === "single" &&
      Boolean(allowedAttributeIds?.length),
  });

  const knownAttributeIds = useMemo(() => {
    const ids = new Set<number>();
    for (const attribute of seedAttributes) ids.add(attribute.id);
    for (const attribute of pickedAttributes) ids.add(attribute.id);
    for (const attribute of attributesQuery.data?.data ?? []) ids.add(attribute.id);
    for (const attribute of catalogQuery.data?.data ?? []) ids.add(attribute.id);
    return ids;
  }, [
    attributesQuery.data?.data,
    catalogQuery.data?.data,
    pickedAttributes,
    seedAttributes,
  ]);

  const missingSelectedIds = useMemo(
    () => attributeIds.filter((id) => !knownAttributeIds.has(id)),
    [attributeIds, knownAttributeIds],
  );

  const missingSelectedQuery = useCrudQuery({
    queryKey: ["attributes", "value-selector", "selected", missingSelectedIds.join(",")],
    queryFn: () => Promise.all(missingSelectedIds.map((id) => attributesService.getById(id))),
    enabled: enabled && selectionMode === "multi" && missingSelectedIds.length > 0,
  });

  const resolvedSeeds = useMemo(() => {
    const fetched = catalogQuery.data?.data ?? [];
    if (
      selectionMode === "single" &&
      allowedAttributeIds?.length &&
      allowedAttributeValueIds?.length
    ) {
      const poolSeeds = buildAttributeSeedsFromPoolIds(
        fetched,
        allowedAttributeIds,
        allowedAttributeValueIds,
      );
      return mergeAttributeCatalog(seedAttributes, poolSeeds);
    }
    return seedAttributes;
  }, [
    allowedAttributeIds,
    allowedAttributeValueIds,
    catalogQuery.data?.data,
    seedAttributes,
    selectionMode,
  ]);

  const attributes = useMemo(() => {
    const searchPage = attributesQuery.data?.data ?? [];
    const catalogPage = catalogQuery.data?.data ?? [];
    const missingSelected = missingSelectedQuery.data ?? [];
    const loadedAsAttributes: Attribute[] = Object.entries(loadedValuesByAttributeId).map(
      ([id, values]) => ({
        id: Number(id),
        title: "",
        publish: true,
        values,
      }),
    );

    const merged = mergeAttributeCatalog(
      resolvedSeeds,
      mergeAttributeCatalog(
        pickedAttributes,
        mergeAttributeCatalog(missingSelected, mergeAttributeCatalog(searchPage, catalogPage)),
      ),
    );
    const withLoadedValues = mergeAttributeCatalog(merged, loadedAsAttributes);

    const allowedAttributeIdSet = allowedAttributeIds?.length
      ? new Set(allowedAttributeIds)
      : null;

    return withLoadedValues
      .filter((attribute) => {
        if (allowedAttributeIdSet && !allowedAttributeIdSet.has(attribute.id)) {
          return false;
        }
        return true;
      })
      .sort((left, right) => getAttributeLabel(left).localeCompare(getAttributeLabel(right)));
  }, [
    allowedAttributeIds,
    attributesQuery.data?.data,
    catalogQuery.data?.data,
    loadedValuesByAttributeId,
    missingSelectedQuery.data,
    pickedAttributes,
    resolvedSeeds,
  ]);

  const selectedAttributes = useMemo(() => {
    const byId = new Map(attributes.map((attribute) => [attribute.id, attribute]));
    return attributeIds
      .map((id) => byId.get(id))
      .filter((attribute): attribute is Attribute => attribute != null);
  }, [attributeIds, attributes]);

  const rememberAttribute = (attribute: Attribute) => {
    setPickedAttributes((current) => {
      const next = current.filter((entry) => entry.id !== attribute.id);
      return [...next, attribute];
    });
  };

  const handleValuesLoaded = useCallback(
    (attributeId: number, values: AttributeValueSummary[]) => {
      setLoadedValuesByAttributeId((current) => {
        const previous = current[attributeId] ?? [];
        if (
          previous.length === values.length &&
          previous.every((value, index) => value.id === values[index]?.id)
        ) {
          return current;
        }
        return { ...current, [attributeId]: values };
      });
    },
    [],
  );

  const addAttribute = (attribute: Attribute) => {
    rememberAttribute(attribute);
    if (!attributeIds.includes(attribute.id)) {
      onChange([...attributeIds, attribute.id], attributeValueIds);
    }
  };

  const removeAttribute = (attributeId: number, knownValueIds: number[]) => {
    const valueIdsToRemove = new Set(knownValueIds);
    onChange(
      attributeIds.filter((id) => id !== attributeId),
      attributeValueIds.filter((id) => !valueIdsToRemove.has(id)),
    );
  };

  const toggleValue = (
    attributeId: number,
    valueId: number,
    checked: boolean,
    _knownValueIds: number[],
  ) => {
    // Keep the attribute assigned even if the last value is unchecked —
    // remove explicitly via the card's remove action (WordPress-style).
    const nextValueIds = checked
      ? attributeValueIds.includes(valueId)
        ? attributeValueIds
        : [...attributeValueIds, valueId]
      : attributeValueIds.filter((id) => id !== valueId);

    onChange(
      attributeIds.includes(attributeId) ? attributeIds : [...attributeIds, attributeId],
      nextValueIds,
    );
  };

  const selectAllValuesForAttribute = (
    attributeId: number,
    visibleValueIds: number[],
    knownValueIds: number[],
  ) => {
    const valueIdsForAttribute = new Set(knownValueIds);
    const nextValueIds = [
      ...attributeValueIds.filter((id) => !valueIdsForAttribute.has(id)),
      ...visibleValueIds,
    ];
    onChange(
      attributeIds.includes(attributeId) ? attributeIds : [...attributeIds, attributeId],
      nextValueIds,
    );
  };

  const clearValuesForAttribute = (attributeId: number, knownValueIds: number[]) => {
    const valueIdsToRemove = new Set(knownValueIds);
    onChange(
      attributeIds.includes(attributeId) ? attributeIds : [...attributeIds, attributeId],
      attributeValueIds.filter((id) => !valueIdsToRemove.has(id)),
    );
  };

  const clearAllAttributeValues = () => {
    onChange(attributeIds, []);
  };

  const selectCreatedAttribute = (attribute: Attribute, createdValues: AttributeValue[]) => {
    const attributeWithValues: Attribute = {
      ...attribute,
      values: createdValues.map(toValueSummary),
    };
    rememberAttribute(attributeWithValues);
    setLoadedValuesByAttributeId((current) => ({
      ...current,
      [attribute.id]: attributeWithValues.values ?? [],
    }));

    const nextValueIds = createdValues.map((value) => value.id);
    onChange(
      attributeIds.includes(attribute.id) ? attributeIds : [...attributeIds, attribute.id],
      [...new Set([...attributeValueIds, ...nextValueIds])],
    );
  };

  const selectCreatedAttributeValue = (attributeId: number, createdValue: AttributeValue) => {
    setLoadedValuesByAttributeId((current) => ({
      ...current,
      [attributeId]: mergeValues(current[attributeId], [toValueSummary(createdValue)]),
    }));

    onChange(
      attributeIds.includes(attributeId) ? attributeIds : [...attributeIds, attributeId],
      attributeValueIds.includes(createdValue.id)
        ? attributeValueIds
        : [...attributeValueIds, createdValue.id],
    );
  };

  const selectSingleValue = (attributeId: number, valueId: number, knownValueIds: number[]) => {
    const valueIdsForAttribute = new Set(knownValueIds);
    const nextValueIds = [
      ...attributeValueIds.filter((id) => !valueIdsForAttribute.has(id)),
      valueId,
    ];
    onChange(
      attributeIds.includes(attributeId) ? attributeIds : [...attributeIds, attributeId],
      nextValueIds,
    );
  };

  const fieldLabel = label ?? t.productAttributes;
  const pageAttributes = attributesQuery.data?.data ?? [];
  const availableToAdd = pageAttributes.filter((attribute) => !attributeIds.includes(attribute.id));
  const hasSelectedValues = attributeValueIds.length > 0;

  if (selectionMode === "single") {
    if (enabled && catalogQuery.isLoading && !attributes.length) {
      return <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>;
    }

    if (!attributes.length) {
      return <p className="text-sm text-muted-foreground">{t.noAttributesAvailable}</p>;
    }

    return (
      <FormField label={fieldLabel} fieldId={fieldId} error={error} required={required}>
        <div className="grid gap-4 sm:grid-cols-2">
          {attributes.map((attribute) => (
            <AttributeSingleSelect
              key={`${selectInstanceKey}-${attribute.id}`}
              attribute={attribute}
              attributeValueIds={attributeValueIds}
              onSelect={selectSingleValue}
              disabled={disabled}
              required={required}
              allowedAttributeValueIds={allowedAttributeValueIds}
              selectInstanceKey={selectInstanceKey}
              enabled={enabled}
            />
          ))}
        </div>
      </FormField>
    );
  }

  return (
    <FormField label={fieldLabel} fieldId={fieldId} error={error} required={required}>
      <div className="space-y-3">
        {selectedAttributes.length > 0 ? (
          <div className="space-y-3">
            {selectedAttributes.map((attribute) => (
              <SelectedAttributeCard
                key={attribute.id}
                attribute={attribute}
                attributeValueIds={attributeValueIds}
                disabled={disabled}
                allowCreateAttribute={allowCreateAttribute}
                showVariableProductHint={showVariableProductHint}
                enabled={enabled}
                onValuesLoaded={handleValuesLoaded}
                onToggleValue={toggleValue}
                onSelectAll={selectAllValuesForAttribute}
                onClearValues={clearValuesForAttribute}
                onRemoveAttribute={removeAttribute}
                onCreatedValue={selectCreatedAttributeValue}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.selectAttributesHint}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="justify-between gap-2"
              onClick={() => setIsPickerOpen((current) => !current)}
              disabled={disabled}
              aria-expanded={isPickerOpen}
              aria-controls={panelId}
            >
              <span>{isPickerOpen ? t.closePicker : t.selectAttribute}</span>
              <ChevronDown className={cn("size-4 transition-transform", isPickerOpen && "rotate-180")} />
            </Button>

            {allowCreateAttribute ? (
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => setIsCreateAttributeOpen(true)}
              >
                <Plus className="size-4" aria-hidden="true" />
                {t.addAttribute}
              </AppButton>
            ) : null}
          </div>

          {hasSelectedValues ? (
            <button
              type="button"
              className="text-xs font-medium text-destructive hover:underline"
              disabled={disabled}
              onClick={clearAllAttributeValues}
            >
              {t.clearAllAttributeValues}
            </button>
          ) : null}
        </div>

        {isPickerOpen ? (
          <RelationPickerPanel
            panelId={panelId}
            onClose={() => setIsPickerOpen(false)}
            selectedCount={attributeIds.length}
          >
            <Input
              value={attributeSearch}
              onChange={(event) => setAttributeSearch(event.target.value)}
              placeholder={t.attributeSearchPlaceholder}
              disabled={disabled}
              autoFocus
            />

            {attributesQuery.isLoading && availableToAdd.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
            ) : attributesQuery.isError ? (
              <div className="space-y-2">
                <p className="text-sm text-destructive">
                  {resolveServiceErrorMessage(attributesQuery.error, t)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void attributesQuery.refetch()}
                >
                  {t.tryAgain}
                </Button>
              </div>
            ) : availableToAdd.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {attributeSearch.trim() ? t.noData : t.noAttributesAvailable}
              </p>
            ) : (
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {availableToAdd.map((attribute) => (
                  <button
                    key={attribute.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => addAttribute(attribute)}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-start text-sm text-foreground transition-colors hover:bg-muted/60"
                  >
                    <span className="min-w-0 truncate">{getAttributeLabel(attribute)}</span>
                  </button>
                ))}
              </div>
            )}
          </RelationPickerPanel>
        ) : null}
      </div>

      {allowCreateAttribute ? (
        <CreateAttributeWithValuesDialog
          open={isCreateAttributeOpen}
          onOpenChange={setIsCreateAttributeOpen}
          onCreated={selectCreatedAttribute}
        />
      ) : null}
    </FormField>
  );
}
