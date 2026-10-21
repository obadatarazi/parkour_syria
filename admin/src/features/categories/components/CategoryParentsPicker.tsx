import { Check, ChevronDown, X } from "lucide-react";
import { useId, useState } from "react";

import {
  getCategoryParentLabel,
  useCategoryParentsPicker,
} from "@/features/categories/hooks/use-category-parents-picker";
import { CATEGORY_TREE_INDENT_REM } from "@/features/categories/utils/category-tree.utils";
import { FormField } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { cn } from "@/shared/design-system/components/ui/utils";

type CategoryParentsPickerProps = {
  value: number[];
  onChange: (parentCategoryIds: number[]) => void;
  excludeCategoryId?: number;
  disabled?: boolean;
};

export function CategoryParentsPicker({
  value,
  onChange,
  excludeCategoryId,
  disabled = false,
}: CategoryParentsPickerProps) {
  const t = useTranslation();
  const fieldId = useId();
  const panelId = `${fieldId}-panel`;
  const [isOpen, setIsOpen] = useState(false);
  const {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageCategories,
    selectedCategories,
    forbiddenParentIds,
    isLoading,
    isError,
    error,
    refetch,
  } = useCategoryParentsPicker({
    selectedIds: value,
    excludeCategoryId,
    enabled: !disabled,
    isOpen,
  });

  const toggleCategory = (categoryId: number) => {
    if (value.includes(categoryId)) {
      onChange(value.filter((id) => id !== categoryId));
      return;
    }
    if (forbiddenParentIds.has(categoryId)) return;
    onChange([...value, categoryId]);
  };

  return (
    <FormField label={t.parentCategories} fieldId={fieldId}>
      <div className="space-y-3">
        {selectedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-foreground"
              >
                {getCategoryParentLabel(category)}
                {!disabled ? (
                  <button
                    type="button"
                    className="rounded p-0.5 hover:bg-muted"
                    onClick={() => toggleCategory(category.id)}
                    aria-label={t.removeItem}
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.noParentCategories}</p>
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
          <span>{isOpen ? t.closePicker : t.selectParentCategories}</span>
          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen ? (
          <div
            id={panelId}
            className="space-y-3 rounded-xl border border-border bg-muted/10 p-3"
          >
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.categorySearchPlaceholder}
              disabled={disabled}
            />

            {isLoading ? (
              <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
            ) : isError ? (
              <div className="space-y-2">
                <p className="text-sm text-destructive">{resolveServiceErrorMessage(error, t)}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                  {t.tryAgain}
                </Button>
              </div>
            ) : pageCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noData}</p>
            ) : (
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {pageCategories.map((category) => {
                  const label = getCategoryParentLabel(category);
                  const isSelected = value.includes(category.id);
                  const treeDepth = Math.max(0, category.depth ?? 0);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleCategory(category.id)}
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
          </div>
        ) : null}
      </div>
    </FormField>
  );
}
