import { useMemo } from "react";

import type { ProductImportAction } from "@/features/products/types/product-import.types";
import type { ProductImportPreviewGroup } from "@/features/products/utils/parse-product-import-csv";
import { formatImportRowRange } from "@/features/products/utils/parse-product-import-csv";
import { StatusBadge } from "@/shared/components";
import { Checkbox } from "@/shared/design-system/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/design-system/components/ui/table";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ProductImportPreviewTableProps = {
  groups: ProductImportPreviewGroup[];
  selectedGroupIds: string[];
  /** Admin-chosen mode shown for every row before import. */
  effectiveAction: ProductImportAction;
  onSelectionChange: (groupIds: string[]) => void;
};

function actionBadge(
  action: ProductImportAction,
  labels: { add: string; update: string; upsert: string },
): { label: string; variant: "success" | "warning" | "neutral" } {
  if (action === "create") {
    return { label: labels.add, variant: "success" };
  }
  if (action === "update") {
    return { label: labels.update, variant: "warning" };
  }
  return { label: labels.upsert, variant: "neutral" };
}

export function ProductImportPreviewTable({
  groups,
  selectedGroupIds,
  effectiveAction,
  onSelectionChange,
}: ProductImportPreviewTableProps) {
  const t = useTranslation();

  const selectableGroupIds = useMemo(
    () => groups.filter((group) => group.validationErrors.length === 0).map((group) => group.id),
    [groups],
  );

  const allSelectableSelected =
    selectableGroupIds.length > 0 &&
    selectableGroupIds.every((groupId) => selectedGroupIds.includes(groupId));

  const someSelectableSelected = selectableGroupIds.some((groupId) =>
    selectedGroupIds.includes(groupId),
  );

  const toggleAll = () => {
    onSelectionChange(allSelectableSelected ? [] : selectableGroupIds);
  };

  const toggleGroup = (groupId: string, disabled: boolean) => {
    if (disabled) return;

    onSelectionChange(
      selectedGroupIds.includes(groupId)
        ? selectedGroupIds.filter((id) => id !== groupId)
        : [...selectedGroupIds, groupId],
    );
  };

  const effectiveBadge = actionBadge(effectiveAction, {
    add: t.productImportActionAdd,
    update: t.productImportActionUpdate,
    upsert: t.productImportActionUpsert,
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          {t.productImportPreviewCount
            .replace("{products}", String(groups.length))
            .replace("{rows}", String(groups.reduce((total, group) => total + group.variantCount, 0)))}
        </p>
        <p>
          {t.productImportSelectedCount.replace("{count}", String(selectedGroupIds.length))}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelectableSelected ? true : someSelectableSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                    disabled={selectableGroupIds.length === 0}
                    aria-label={t.selectAllRows}
                  />
                </TableHead>
                <TableHead>{t.product}</TableHead>
                <TableHead>{t.productType}</TableHead>
                <TableHead>{t.productImportActionCol}</TableHead>
                <TableHead>{t.brand}</TableHead>
                <TableHead>{t.categoriesCol}</TableHead>
                <TableHead>{t.productImportVariantsCol}</TableHead>
                <TableHead>{t.productImportRowsCol}</TableHead>
                <TableHead>{t.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => {
                const isInvalid = group.validationErrors.length > 0;
                const isSelected = selectedGroupIds.includes(group.id);

                return (
                  <TableRow key={group.id} data-state={isSelected ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        disabled={isInvalid}
                        onCheckedChange={() => toggleGroup(group.id, isInvalid)}
                        aria-label={t.productImportSelectProduct.replace("{title}", group.titleEn || t.notSet)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium text-foreground">{group.titleEn || t.notSet}</p>
                        {group.titleAr ? (
                          <p className="text-xs text-muted-foreground">{group.titleAr}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={
                          group.type === "SIMPLE" ? t.productTypeSimple : t.productTypeVariant
                        }
                        variant="neutral"
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge label={effectiveBadge.label} variant={effectiveBadge.variant} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{group.brand || t.notSet}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-muted-foreground">
                      {group.categories || t.notSet}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{group.variantCount}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatImportRowRange(group.rowNumbers)}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {isInvalid ? (
                        <ul className="space-y-1 text-xs text-destructive">
                          {group.validationErrors.map((error) => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      ) : (
                        <StatusBadge label={t.productImportReady} variant="success" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
