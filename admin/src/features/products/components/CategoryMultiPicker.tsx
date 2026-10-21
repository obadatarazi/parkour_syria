import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import {
  getCategoryMultiLabel,
  useCategoryMultiPicker,
} from "@/features/products/hooks/use-category-multi-picker";
import { RelationPickerPanel } from "@/features/products/components/RelationPickerPanel";
import type { RelationPickerSeed } from "@/features/products/types/products.types";
import type { Category } from "@/features/categories/types/categories.types";
import { CATEGORY_TREE_INDENT_REM } from "@/features/categories/utils/category-tree.utils";
import { FormField } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { cn } from "@/shared/design-system/components/ui/utils";

type CategoryMultiPickerProps = {
  value: number[];
  seedItems?: RelationPickerSeed[];
  onChange: (categoryIds: number[]) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
};

function categoryToSeed(category: Category): RelationPickerSeed {
  return {
    id: category.id,
    title: category.title,
    ...(category.translations ? { translations: category.translations } : {}),
  };
}

export function CategoryMultiPicker({
  value,
  seedItems = [],
  onChange,
  disabled = false,
  error,
  required = true,
}: CategoryMultiPickerProps) {
  const t = useTranslation();
  const fieldId = useId();
  const panelId = `${fieldId}-panel`;
  const [isOpen, setIsOpen] = useState(false);
  const [pickedItems, setPickedItems] = useState<RelationPickerSeed[]>([]);

  const seedKey = seedItems.map((item) => item.id).join(",");

  useEffect(() => {
    setPickedItems([]);
  }, [seedKey]);

  const {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageCategories,
    selectedCategories,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useCategoryMultiPicker({
    selectedIds: value,
    seedItems,
    pickedItems,
    enabled: !disabled,
    isOpen,
  });

  const rememberCategory = (category: Category) => {
    setPickedItems((current) => {
      const next = current.filter((item) => item.id !== category.id);
      return [...next, categoryToSeed(category)];
    });
  };

  const toggleCategory = (category: Category) => {
    if (value.includes(category.id)) {
      onChange(value.filter((id) => id !== category.id));
      return;
    }
    rememberCategory(category);
    onChange([...value, category.id]);
  };

  const closePanel = () => setIsOpen(false);

  return (
    <FormField label={t.categoriesCol} fieldId={fieldId} error={error} required={required}>
      <div className="space-y-3">
        {selectedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-foreground"
              >
                {getCategoryMultiLabel(category)}
                {!disabled ? (
                  <button
                    type="button"
                    className="rounded p-0.5 hover:bg-muted"
                    onClick={() => toggleCategory(category)}
                    aria-label={t.removeItem}
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.selectCategories}</p>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsOpen((current) => !current)}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-controls={panelId}
        >
          <span>{isOpen ? t.closePicker : t.selectCategories}</span>
          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen ? (
          <RelationPickerPanel
            panelId={panelId}
            onClose={closePanel}
            selectedCount={value.length}
          >
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.categorySearchPlaceholder}
              disabled={disabled}
            />

            {isLoading && pageCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
            ) : isError ? (
              <div className="space-y-2">
                <p className="text-sm text-destructive">
                  {resolveServiceErrorMessage(queryError, t)}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                  {t.tryAgain}
                </Button>
              </div>
            ) : pageCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noData}</p>
            ) : (
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {pageCategories.map((category) => {
                  const label = getCategoryMultiLabel(category);
                  const isSelected = value.includes(category.id);
                  const treeDepth = Math.max(0, category.depth ?? 0);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleCategory(category)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/60",
                      )}
                      style={
                        treeDepth > 0
                          ? { paddingInlineStart: `${0.75 + treeDepth * CATEGORY_TREE_INDENT_REM}rem` }
                          : undefined
                      }
                    >
                      <span className="min-w-0 truncate">{label}</span>
                      {isSelected ? <Check className="size-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            )}

            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  {t.previous}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  {t.nextPage}
                </Button>
              </div>
            ) : null}
          </RelationPickerPanel>
        ) : null}
      </div>
    </FormField>
  );
}
