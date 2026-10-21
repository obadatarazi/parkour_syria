import type { Currency } from "@/features/currencies/types/currencies.types";
import { StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { getBilingualTitle } from "@/shared/lib/translation-display.utils";

type CurrencyViewDialogProps = {
  open: boolean;
  currency: Currency | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (currency: Currency) => void;
  onDelete?: (currency: Currency) => void;
};

export function CurrencyViewDialog({
  open,
  currency,
  canUpdate = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onDelete,
}: CurrencyViewDialogProps) {
  const t = useTranslation();

  if (!currency) return null;

  const title = getBilingualTitle(currency.translations, currency.title);
  const allowDelete = canDelete && !currency.isDefault;

  const sections: CrudViewDialogSection[] = [
    {
      id: "content",
      title: t.currencyContent,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.titleEnglish}>
            {title.en || <span className="text-muted-foreground">{t.notSet}</span>}
          </CrudDetailField>
          <CrudDetailField label={t.titleArabic}>
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
      title: t.currencyDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{currency.id}</CrudDetailField>
          <CrudDetailField label={t.currencyCode}>{currency.code}</CrudDetailField>
          <CrudDetailField label={t.currencySymbol}>{currency.symbol}</CrudDetailField>
          <CrudDetailField label={t.defaultCurrency}>
            {currency.isDefault ? t.defaultCurrency : t.notDefaultCurrency}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={currency}
      onOpenChange={onOpenChange}
      title={t.viewCurrency}
      cancelLabel={t.cancel}
      canUpdate={canUpdate}
      canDelete={allowDelete}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      onEdit={onEdit}
      onDelete={onDelete}
      sections={sections}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-background text-2xl font-semibold"
            aria-hidden="true"
          >
            {currency.symbol || "💱"}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-lg font-semibold text-foreground">{title.en || title.ar}</p>
              {title.ar && title.en ? (
                <p dir="rtl" className="mt-1 text-sm text-muted-foreground">
                  {title.ar}
                </p>
              ) : null}
              <p className="mt-1 text-sm text-muted-foreground">
                {currency.code}
                {currency.symbol ? ` · ${currency.symbol}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={currency.publish ? t.active : t.inactive}
                variant={currency.publish ? "success" : "neutral"}
              />
              {currency.isDefault ? (
                <StatusBadge label={t.defaultCurrency} variant="info" />
              ) : null}
            </div>
          </div>
        </div>
      }
    />
  );
}
