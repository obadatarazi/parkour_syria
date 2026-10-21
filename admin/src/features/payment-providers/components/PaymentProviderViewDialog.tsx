import type { PaymentProvider } from "@/features/payment-providers/types/payment-providers.types";
import {
  BilingualText,
  BrandImagePlaceholder,
  EntityMediaThumbnail,
  StatusBadge,
} from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  getBilingualDescription,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

type PaymentProviderViewDialogProps = {
  open: boolean;
  paymentProvider: PaymentProvider | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (paymentProvider: PaymentProvider) => void;
  onDelete?: (paymentProvider: PaymentProvider) => void;
};

export function PaymentProviderViewDialog({
  open,
  paymentProvider,
  canUpdate = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onDelete,
}: PaymentProviderViewDialogProps) {
  const t = useTranslation();

  if (!paymentProvider) return null;

  const title = getBilingualTitle(paymentProvider.translations, paymentProvider.title);
  const description = getBilingualDescription(
    paymentProvider.translations,
    paymentProvider.description,
  );
  const allowDelete = canDelete && !paymentProvider.standard;

  const sections: CrudViewDialogSection[] = [
    {
      id: "content",
      title: t.paymentProviderContent,
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
          <CrudDetailField label={t.descriptionEnglish}>
            {description.en || <span className="text-muted-foreground">{t.notSet}</span>}
          </CrudDetailField>
          <CrudDetailField label={t.descriptionArabic}>
            {description.ar ? (
              <span dir="rtl" className="block">
                {description.ar}
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
      title: t.paymentProviderDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{paymentProvider.id}</CrudDetailField>
          <CrudDetailField label={t.paymentProviderType}>
            {paymentProvider.type?.label || (
              <span className="text-muted-foreground">{t.notSet}</span>
            )}
          </CrudDetailField>
          <CrudDetailField label={t.standardPaymentProvider}>
            {paymentProvider.standard
              ? t.standardPaymentProvider
              : t.notStandardPaymentProvider}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={paymentProvider}
      onOpenChange={onOpenChange}
      title={t.viewPaymentProvider}
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
          <EntityMediaThumbnail
            imageUrl={paymentProvider.imageFileUrl}
            size="lg"
            placeholder={<BrandImagePlaceholder size="lg" />}
          />

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <BilingualText values={title} titleClassName="text-lg font-semibold" />
              {description.en || description.ar ? (
                <div className="mt-2 text-sm text-muted-foreground">
                  <BilingualText values={description} titleClassName="font-normal" />
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={paymentProvider.publish ? t.active : t.inactive}
                variant={paymentProvider.publish ? "success" : "neutral"}
              />
              {paymentProvider.standard ? (
                <StatusBadge label={t.standardPaymentProvider} variant="info" />
              ) : null}
            </div>
          </div>
        </div>
      }
    />
  );
}
