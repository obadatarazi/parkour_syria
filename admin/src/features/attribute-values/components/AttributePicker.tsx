import { Check, ChevronDown, X } from "lucide-react";
import { useId, useState } from "react";

import { attributesService } from "@/features/attributes/services/attributes.service";
import type { Attribute } from "@/features/attributes/types/attributes.types";
import { RelationPickerPanel } from "@/features/products/components/RelationPickerPanel";
import { FormField } from "@/shared/components";
import { useCrudQuery } from "@/shared/crud";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";
import { cn } from "@/shared/design-system/components/ui/utils";

type AttributePickerProps = {
  value: number | null;
  onChange: (attributeId: number | null) => void;
  disabled?: boolean;
  error?: string;
};

function getAttributeLabel(attribute: Attribute): string {
  return formatBilingualLabel(getBilingualTitle(attribute.translations, attribute.title));
}

export function AttributePicker({ value, onChange, disabled = false, error }: AttributePickerProps) {
  const t = useTranslation();
  const fieldId = useId();
  const panelId = `${fieldId}-panel`;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const listQuery = useCrudQuery({
    queryKey: ["attributes", "picker", search],
    queryFn: async () => {
      const result = await attributesService.list({
        limit: 50,
        search: search.trim() || undefined,
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
    enabled: !disabled && isOpen,
  });

  const selectedQuery = useCrudQuery({
    queryKey: ["attributes", "picker", "selected", String(value)],
    queryFn: () => (value != null ? attributesService.getById(value) : Promise.resolve(null)),
    enabled: !disabled && value != null,
  });

  const selectedAttribute = selectedQuery.data;
  const pageAttributes = listQuery.data?.data ?? [];
  const closePanel = () => setIsOpen(false);

  return (
    <FormField label={t.attribute} fieldId={fieldId} error={error} required>
      <div className="space-y-3">
        {value != null && selectedAttribute ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex min-w-0 flex-1 items-center rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground">
              <span className="truncate">{getAttributeLabel(selectedAttribute)}</span>
            </span>
            {!disabled ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => onChange(null)}
                aria-label={t.removeItem}
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.selectAttribute}</p>
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
          <span>{isOpen ? t.closePicker : t.selectAttribute}</span>
          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen ? (
          <RelationPickerPanel
            panelId={panelId}
            onClose={closePanel}
            selectedCount={value != null ? 1 : 0}
          >
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.search}
              disabled={disabled}
            />

            {listQuery.isLoading && pageAttributes.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
            ) : listQuery.isError ? (
              <div className="space-y-2">
                <p className="text-sm text-destructive">
                  {resolveServiceErrorMessage(listQuery.error, t)}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => void listQuery.refetch()}>
                  {t.tryAgain}
                </Button>
              </div>
            ) : pageAttributes.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noData}</p>
            ) : (
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {pageAttributes.map((attribute) => {
                  const label = getAttributeLabel(attribute);
                  const isSelected = value === attribute.id;

                  return (
                    <button
                      key={attribute.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onChange(attribute.id)}
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
          </RelationPickerPanel>
        ) : null}
      </div>
    </FormField>
  );
}
