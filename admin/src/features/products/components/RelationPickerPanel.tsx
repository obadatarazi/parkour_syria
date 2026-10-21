import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/shared/design-system/components/ui/button";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type RelationPickerPanelProps = {
  panelId: string;
  onClose: () => void;
  children: ReactNode;
  selectedCount?: number;
};

export function RelationPickerPanel({
  panelId,
  onClose,
  children,
  selectedCount,
}: RelationPickerPanelProps) {
  const t = useTranslation();

  const selectedLabel =
    selectedCount != null && selectedCount > 0
      ? t.pickerSelectedCount.replace("{count}", String(selectedCount))
      : undefined;

  return (
    <div
      id={panelId}
      className="space-y-3 rounded-xl border border-border bg-muted/10 p-3 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
        <p className="min-h-5 text-xs text-muted-foreground">
          {selectedLabel ?? t.pickerSelectHint}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={onClose}
          aria-label={t.closePicker}
        >
          <X className="size-4" />
        </Button>
      </div>

      {children}

      <div className="flex justify-end border-t border-border/60 pt-2">
        <Button type="button" size="sm" onClick={onClose}>
          {t.pickerDone}
        </Button>
      </div>
    </div>
  );
}
