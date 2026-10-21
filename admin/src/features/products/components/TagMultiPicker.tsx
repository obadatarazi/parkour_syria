import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { getTagMultiLabel, useTagMultiPicker } from "@/features/products/hooks/use-tag-multi-picker";
import { RelationPickerPanel } from "@/features/products/components/RelationPickerPanel";
import type { RelationPickerSeed } from "@/features/products/types/products.types";
import type { Tag } from "@/features/tags/types/tags.types";
import { FormField } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { cn } from "@/shared/design-system/components/ui/utils";

type TagMultiPickerProps = {
  value: number[];
  seedItems?: RelationPickerSeed[];
  onChange: (tagIds: number[]) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
};

function tagToSeed(tag: Tag): RelationPickerSeed {
  return {
    id: tag.id,
    title: tag.title,
    ...(tag.translations ? { translations: tag.translations } : {}),
  };
}

export function TagMultiPicker({
  value,
  seedItems = [],
  onChange,
  disabled = false,
  error,
  required = false,
}: TagMultiPickerProps) {
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
    pageTags,
    selectedTags,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useTagMultiPicker({
    selectedIds: value,
    seedItems,
    pickedItems,
    enabled: !disabled,
    isOpen,
  });

  const rememberTag = (tag: Tag) => {
    setPickedItems((current) => {
      const next = current.filter((item) => item.id !== tag.id);
      return [...next, tagToSeed(tag)];
    });
  };

  const toggleTag = (tag: Tag) => {
    if (value.includes(tag.id)) {
      onChange(value.filter((id) => id !== tag.id));
      return;
    }
    rememberTag(tag);
    onChange([...value, tag.id]);
  };

  const closePanel = () => setIsOpen(false);

  return (
    <FormField label={t.tags} fieldId={fieldId} error={error} required={required}>
      <div className="space-y-3">
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-foreground"
              >
                {getTagMultiLabel(tag)}
                {!disabled ? (
                  <button
                    type="button"
                    className="rounded p-0.5 hover:bg-muted"
                    onClick={() => toggleTag(tag)}
                    aria-label={t.removeItem}
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.selectTags}</p>
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
          <span>{isOpen ? t.closePicker : t.selectTags}</span>
          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen ? (
          <RelationPickerPanel panelId={panelId} onClose={closePanel} selectedCount={value.length}>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.search}
              disabled={disabled}
            />

            {isLoading && pageTags.length === 0 ? (
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
            ) : pageTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noData}</p>
            ) : (
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {pageTags.map((tag) => {
                  const label = getTagMultiLabel(tag);
                  const isSelected = value.includes(tag.id);

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/60",
                      )}
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
