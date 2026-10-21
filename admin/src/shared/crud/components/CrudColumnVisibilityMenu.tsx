import { Columns3, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import { AppButton } from "@/shared/components";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/design-system/components/ui/dropdown-menu";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export type CrudColumnVisibilityOption = {
  id: string;
  label: ReactNode;
  /** When false, the column stays visible and cannot be toggled off. */
  hideable?: boolean;
};

type CrudColumnVisibilityMenuProps = {
  columns: CrudColumnVisibilityOption[];
  visibleColumnIds: string[];
  onToggle: (columnId: string) => void;
  onReset?: () => void;
  disabled?: boolean;
};

function resolveColumnLabel(label: ReactNode, fallbackId: string): ReactNode {
  if (typeof label === "string" || typeof label === "number") {
    return label;
  }
  return fallbackId;
}

export function CrudColumnVisibilityMenu({
  columns,
  visibleColumnIds,
  onToggle,
  onReset,
  disabled = false,
}: CrudColumnVisibilityMenuProps) {
  const t = useTranslation();
  const visibleCount = visibleColumnIds.length;
  const toggleableColumns = columns.filter((column) => column.hideable !== false);

  if (toggleableColumns.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AppButton
          variant="outline"
          size="sm"
          className="h-8 rounded-xl text-xs"
          disabled={disabled}
          aria-label={t.tableColumns}
        >
          <Columns3 className="size-3.5" aria-hidden="true" />
          {t.tableColumns}
        </AppButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t.tableColumnsHint}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => {
          const isHideable = column.hideable !== false;
          const checked = visibleColumnIds.includes(column.id);
          const isLastVisible = checked && visibleCount <= 1;

          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={checked}
              disabled={!isHideable || isLastVisible}
              onCheckedChange={() => {
                if (!isHideable || isLastVisible) return;
                onToggle(column.id);
              }}
              onSelect={(event) => event.preventDefault()}
            >
              {resolveColumnLabel(column.label, column.id)}
            </DropdownMenuCheckboxItem>
          );
        })}
        {onReset ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onReset}>
              <RotateCcw className="size-3.5" aria-hidden="true" />
              {t.resetTableColumns}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
