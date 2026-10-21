import { Download, ExternalLink } from "lucide-react";
import { Link } from "react-router";

import { mapInvoiceCustomerToParty } from "@/features/invoices/components/InvoiceRelationCells";
import { useInvoicePdfDownload } from "@/features/invoices/hooks/use-invoice-pdf-download";
import type { Invoice } from "@/features/invoices/types/invoices.types";
import {
  invoiceOrderSearchHref,
  invoiceProductSearchHref,
} from "@/features/invoices/utils/invoice-links";
import { getInvoicePaymentLabel } from "@/features/invoices/utils/map-invoice-from-api";
import {
  orderCreatedByBadge,
  orderCustomerHref,
  orderPartyDisplayName,
} from "@/features/orders/utils/order-customer-display";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { AppButton, PhoneNumberText, StatusBadge, UserLabelText } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type InvoiceViewDialogProps = {
  open: boolean;
  invoice: Invoice | null;
  canDownload?: boolean;
  onOpenChange: (open: boolean) => void;
};

function statusVariant(value?: string | null): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (value) {
    case "PAID":
      return "success";
    case "UNPAID":
      return "warning";
    case "FAILED":
    case "CANCELLED":
    case "EXPIRED":
    case "REFUNDED":
      return "danger";
    default:
      return "neutral";
  }
}

function formatOptionalAmount(value: number | null | undefined, emptyLabel: string): string {
  if (value == null) return emptyLabel;
  return formatKwd(value);
}

export function InvoiceViewDialog({
  open,
  invoice,
  canDownload = false,
  onOpenChange,
}: InvoiceViewDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const { downloadPdf, isDownloading } = useInvoicePdfDownload();

  if (!invoice) return null;

  const party = mapInvoiceCustomerToParty(invoice);
  const customerName = orderPartyDisplayName(party, t.guest);
  const customerHref = orderCustomerHref(party);
  const createdByBadge = orderCreatedByBadge(party, {
    admin: t.adminUserType,
    customer: t.customerUserType,
    guest: t.guest,
  });
  const orderHref = invoiceOrderSearchHref(invoice);
  const orderLabel =
    invoice.orderRefNumber || (invoice.orderId ? `#${invoice.orderId}` : t.notSet);
  const items = invoice.items ?? [];
  const placedByAdmin = party.createdByAdmin?.fullName?.trim();
  const providerPayment = invoice.providerPayment;
  const hasProviderPayment = Boolean(
    providerPayment &&
      Object.values(providerPayment).some((value) => value != null && value !== ""),
  );

  const sections: CrudViewDialogSection[] = [
    {
      id: "details",
      title: t.invoiceDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{invoice.id}</CrudDetailField>
          <CrudDetailField label={t.invoiceNumber}>
            {invoice.invoiceNumber || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.orderNum}>
            {orderHref ? (
              <Link to={orderHref} className="font-mono text-brand hover:underline">
                {orderLabel}
              </Link>
            ) : (
              orderLabel
            )}
          </CrudDetailField>
          <CrudDetailField label={t.invoiceStatus}>
            {invoice.status?.label || invoice.status?.value || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.payment}>
            {getInvoicePaymentLabel(invoice, language === "ar" ? "ar" : "en") || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.paymentMethod}>
            {invoice.paymentMethod || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.total}>{formatKwd(invoice.totalPrice)}</CrudDetailField>
          <CrudDetailField label={t.taxAmount}>
            {formatOptionalAmount(invoice.taxAmount, t.notSet)}
          </CrudDetailField>
          <CrudDetailField label={t.serviceCharge}>
            {formatOptionalAmount(invoice.serviceCharge, t.notSet)}
          </CrudDetailField>
          <CrudDetailField label={t.currency}>
            {invoice.currencyCode ||
              invoice.currency?.title ||
              invoice.currency?.symbol ||
              t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.paidAt}>
            {invoice.paidAt ? formatDateTime(invoice.paidAt, language) : t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.date}>
            {invoice.createdAt ? formatDateTime(invoice.createdAt, language) : t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.providerInvoiceId}>
            {invoice.providerInvoiceId || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.providerTransactionId}>
            {invoice.providerTransactionId || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.paymentUrl}>
            {invoice.paymentUrl ? (
              <a
                href={invoice.paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 break-all text-brand hover:underline"
              >
                {t.openPaymentUrl}
                <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
              </a>
            ) : (
              t.notSet
            )}
          </CrudDetailField>
        </div>
      ),
    },
    {
      id: "customer",
      title: t.customer,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.fullName}>
            {customerHref ? (
              <Link to={customerHref} className="font-medium text-brand hover:underline">
                <UserLabelText value={customerName} />
              </Link>
            ) : (
              <UserLabelText value={customerName} />
            )}
          </CrudDetailField>
          <CrudDetailField label={t.email}>{party.email || t.notSet}</CrudDetailField>
          <CrudDetailField label={t.phone}>
            <PhoneNumberText value={party.phoneNumber} fallback={t.notSet} />
          </CrudDetailField>
          <CrudDetailField label={t.orderCreatedBy}>
            <div className="space-y-1">
              <StatusBadge label={createdByBadge.label} variant={createdByBadge.variant} />
              {placedByAdmin ? (
                <p className="text-xs text-muted-foreground">{placedByAdmin}</p>
              ) : null}
            </div>
          </CrudDetailField>
        </div>
      ),
    },
    {
      id: "items",
      title: t.orderItems,
      content:
        items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.noData}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const title = item.productTitle?.trim() || t.product;
              const productHref = invoiceProductSearchHref(item);

              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
                >
                  <div className="min-w-0">
                    {productHref ? (
                      <Link
                        to={productHref}
                        className="text-sm font-medium text-brand hover:underline"
                      >
                        {title}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{title}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t.quantity}: {item.quantity} · {formatKwd(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatKwd(item.subTotalPrice)}
                  </p>
                </div>
              );
            })}
          </div>
        ),
    },
  ];

  if (hasProviderPayment && providerPayment) {
    sections.push({
      id: "gateway",
      title: t.paymentGatewayDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.invoiceReference}>
            {providerPayment.invoiceReference || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.transactionStatus}>
            {providerPayment.transactionStatus || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.cardBrand}>
            {providerPayment.cardBrand || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.cardNumber}>
            {providerPayment.cardNumber || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.nameOnCard}>
            {providerPayment.nameOnCard || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.authorizationId}>
            {providerPayment.authorizationId || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.paymentId}>
            {providerPayment.paymentId || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.ipAddress}>
            {providerPayment.ipAddress || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.country}>
            {providerPayment.country || t.notSet}
          </CrudDetailField>
        </div>
      ),
    });
  }

  return (
    <CrudViewDialog
      open={open}
      entity={invoice}
      onOpenChange={onOpenChange}
      title={t.viewInvoice}
      cancelLabel={t.close}
      canUpdate={false}
      canDelete={false}
      sections={sections}
      footerActions={
        canDownload && invoice.invoiceNumber ? (
          <AppButton
            variant="secondary"
            disabled={isDownloading}
            onClick={() => void downloadPdf(invoice.invoiceNumber)}
          >
            <Download className="size-4" aria-hidden="true" />
            {t.downloadInvoice}
          </AppButton>
        ) : null
      }
      hero={
        <div className="space-y-3">
          <p className="font-mono text-lg font-semibold text-brand">
            {invoice.invoiceNumber || invoice.orderRefNumber || `#${invoice.id}`}
          </p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={invoice.status?.label || invoice.status?.value || t.notSet}
              variant={statusVariant(invoice.status?.value)}
            />
            <StatusBadge label={formatKwd(invoice.totalPrice)} variant="info" />
            {invoice.taxAmount != null ? (
              <StatusBadge
                label={`${t.taxAmount}: ${formatKwd(invoice.taxAmount)}`}
                variant="neutral"
              />
            ) : null}
            <StatusBadge label={createdByBadge.label} variant={createdByBadge.variant} />
          </div>
        </div>
      }
    />
  );
}
