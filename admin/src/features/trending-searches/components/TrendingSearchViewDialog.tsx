import type { TrendingSearch } from "@/features/trending-searches/types/trending-searches.types";
import { getTrendingSearchLabel } from "@/features/trending-searches/types/trending-searches.types";
import { StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { getBilingualTitle } from "@/shared/lib/translation-display.utils";

type TrendingSearchViewDialogProps = {
  open: boolean;
  item: TrendingSearch | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (item: TrendingSearch) => void;
  onDelete?: (item: TrendingSearch) => void;
};

export function TrendingSearchViewDialog({
  open,
  item,
  canUpdate = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onDelete,
}: TrendingSearchViewDialogProps) {
  const t = useTranslation();

  if (!item) return null;

  const title = getBilingualTitle(item.translations, item.label);

  const sections: CrudViewDialogSection[] = [
    {
      id: "content",
      title: t.trendingSearchContent,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.trendingSearchLabelEnglish}>
            {title.en || <span className="text-muted-foreground">{t.notSet}</span>}
          </CrudDetailField>
          <CrudDetailField label={t.trendingSearchLabelArabic}>
            {title.ar ? (
              <span dir="rtl" className="block">
                {title.ar}
              </span>
            ) : (
              <span className="text-muted-foreground">{t.notSet}</span>
            )}
          </CrudDetailField>
        </div>
      ),
    },
    {
      id: "details",
      title: t.trendingSearchDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{item.id}</CrudDetailField>
          <CrudDetailField label={t.trendingSearchTargetType}>
            {item.targetType?.label || item.targetType?.value || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.trendingSearchTargetId}>
            {item.targetId != null ? `#${item.targetId}` : t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.trendingSearchSortOrder}>{item.sortOrder}</CrudDetailField>
          <CrudDetailField label={t.slug}>
            {item.slug ? (
              <span className="font-mono text-sm">{item.slug}</span>
            ) : (
              <span className="text-muted-foreground">{t.notSet}</span>
            )}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={item}
      onOpenChange={onOpenChange}
      title={t.viewTrendingSearch}
      cancelLabel={t.cancel}
      canUpdate={canUpdate}
      canDelete={canDelete}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      onEdit={onEdit}
      onDelete={onDelete}
      sections={sections}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-background text-3xl"
            aria-hidden="true"
          >
            🔍
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-lg font-semibold text-foreground">{getTrendingSearchLabel(item)}</p>
              {title.ar && title.en ? (
                <p dir="rtl" className="mt-1 text-sm text-muted-foreground">
                  {title.ar}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={item.publish ? t.active : t.inactive}
                variant={item.publish ? "success" : "neutral"}
              />
              {item.targetType?.label || item.targetType?.value ? (
                <StatusBadge
                  label={item.targetType.label || item.targetType.value || ""}
                  variant="info"
                />
              ) : null}
            </div>
          </div>
        </div>
      }
    />
  );
}
