import { Download, MapPin, Package, Pencil, Receipt, ShoppingBag, TicketPercent } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { orderEditPath, ROUTES } from "@/app/router/routes";
import { useInvoicePdfDownload } from "@/features/invoices/hooks/use-invoice-pdf-download";
import { OrderLocationMap } from "@/features/orders/components/OrderLocationMap";
import { useOrderPackingSlipDownload } from "@/features/orders/hooks/use-order-packing-slip-download";
import type { Order } from "@/features/orders/types/orders.types";
import { getOrderAmountDue } from "@/features/orders/types/orders.types";
import { getOrderPaymentLabel } from "@/features/orders/utils/map-order-from-api";
import {
  mapOrderToPartyDisplay,
  orderCreatedByBadge,
  orderCustomerHref,
  orderPartyDisplayName,
} from "@/features/orders/utils/order-customer-display";
import { hasOrderLocationCoords } from "@/features/orders/utils/order-location.utils";
import { getOrderStatusVariant } from "@/features/orders/utils/order-status.utils";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { AppButton, PhoneNumberText, StatusBadge, UserLabelText } from "@/shared/components";
import { CrudDetailField, CrudRecordSection, CrudRecordWorkspace } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { ORDER_FORM_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type OrderViewSectionId = "details" | "items" | "coupons" | "delivery" | "invoice";

type OrderViewWorkspaceProps = {
  order: Order;
  canUpdate: boolean;
  canDownloadPackingSlip?: boolean;
  canDownloadInvoice?: boolean;
  onBack: () => void;
};

function EmptyValue({ label }: { label: string }) {
  return <span className="text-muted-foreground">{label}</span>;
}

export function OrderViewWorkspace({
  order,
  canUpdate,
  canDownloadPackingSlip = false,
  canDownloadInvoice = false,
  onBack,
}: OrderViewWorkspaceProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const [activeSection, setActiveSection] = useState<OrderViewSectionId>("details");
  const { downloadPackingSlip, isDownloading: isPackingSlipDownloading } =
    useOrderPackingSlipDownload();
  const { downloadPdf, isDownloading: isInvoiceDownloading } = useInvoicePdfDownload();

  const party = mapOrderToPartyDisplay(order);
  const customerName = orderPartyDisplayName(party, t.guest);
  const customerHref = orderCustomerHref(party);
  const createdByBadge = orderCreatedByBadge(party, {
    admin: t.adminUserType,
    customer: t.customerUserType,
    guest: t.guest,
  });
  const placedByAdmin = party.createdByAdmin?.fullName?.trim();
  const statusLabel = order.status?.label || order.status?.value || t.notSet;
  const invoiceNumber = order.invoice?.invoiceNumber;
  const itemCount = order.itemsCount ?? order.items?.length ?? 0;
  const displayTotal = getOrderAmountDue(order);

  const sectionItems: {
    id: OrderViewSectionId;
    label: string;
    icon: typeof Package;
    guidance?: string;
  }[] = [
    { id: "details", label: t.orderDetails, icon: Package },
    { id: "items", label: t.orderItems, icon: ShoppingBag },
    { id: "coupons", label: t.orderCoupons, icon: TicketPercent, guidance: ORDER_FORM_ANCHORS.couponsNav },
    { id: "delivery", label: t.orderDelivery, icon: MapPin },
    { id: "invoice", label: t.invoice, icon: Receipt },
  ];

  return (
    <CrudRecordWorkspace
      breadcrumbHref={ROUTES.admin.orders}
      breadcrumbLabel={t.orders}
      title={order.orderRefNumber}
      subtitle={t.orderViewHint}
      meta={
        <>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {t.idLabel}: {order.id}
          </span>
          <StatusBadge label={statusLabel} variant={getOrderStatusVariant(order.status?.value)} />
        </>
      }
      onBack={onBack}
      backLabel={t.backToOrders}
      headerActions={
        <>
          {canDownloadPackingSlip ? (
            <AppButton
              type="button"
              variant="outline"
              disabled={isPackingSlipDownloading || !order.orderRefNumber}
              onClick={() => void downloadPackingSlip(order.orderRefNumber)}
            >
              <Download className="size-4" aria-hidden="true" />
              {t.downloadPackingSlip}
            </AppButton>
          ) : null}
          {canDownloadInvoice && invoiceNumber ? (
            <AppButton
              type="button"
              variant="outline"
              disabled={isInvoiceDownloading}
              onClick={() => void downloadPdf(invoiceNumber)}
            >
              <Download className="size-4" aria-hidden="true" />
              {t.downloadInvoice}
            </AppButton>
          ) : null}
          {canUpdate ? (
            <AppButton type="button" asChild>
              <Link to={orderEditPath(order)}>
                <Pencil className="size-4" aria-hidden="true" />
                {t.editAction}
              </Link>
            </AppButton>
          ) : null}
        </>
      }
      sections={sectionItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      sectionsAriaLabel={t.orderFormSections}
      aside={
        <aside className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t.orderPreview}
            </p>
            <StatusBadge
              label={statusLabel}
              variant={getOrderStatusVariant(order.status?.value)}
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground"
                aria-hidden="true"
              >
                <Package className="size-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="truncate font-mono text-base font-semibold tracking-wide text-foreground">
                  {order.orderRefNumber}
                </p>
                <p className="truncate text-sm text-muted-foreground">{customerName}</p>
                <p className="text-sm font-medium text-foreground">{formatKwd(displayTotal)}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 text-xs">
            <div className="text-start">
              <p className="text-muted-foreground">{t.items}</p>
              <p className="mt-0.5 font-semibold tabular-nums text-foreground">{itemCount}</p>
            </div>
            <div className="text-start">
              <p className="text-muted-foreground">{t.customer}</p>
              <p className="mt-0.5 truncate font-semibold text-foreground">{customerName}</p>
            </div>
          </div>
        </aside>
      }
    >
      {activeSection === "details" ? (
        <CrudRecordSection title={t.orderDetails} as="h2">
          <div className="grid gap-4 sm:grid-cols-2">
            <CrudDetailField label={t.orderNum}>{order.orderRefNumber}</CrudDetailField>
            <CrudDetailField label={t.date}>
              {order.createdAt ? (
                formatDateTime(order.createdAt, language)
              ) : (
                <EmptyValue label={t.notSet} />
              )}
            </CrudDetailField>
            <CrudDetailField label={t.fullName}>
              {customerHref ? (
                <Link to={customerHref} className="font-medium text-brand hover:underline">
                  <UserLabelText value={customerName} />
                </Link>
              ) : (
                <UserLabelText value={customerName} />
              )}
            </CrudDetailField>
            <CrudDetailField label={t.email}>
              {party.email || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.phone}>
              <PhoneNumberText
                value={party.phoneNumber}
                fallback={<EmptyValue label={t.notSet} />}
              />
            </CrudDetailField>
            <CrudDetailField label={t.orderCreatedBy}>
              <div className="space-y-1">
                <StatusBadge label={createdByBadge.label} variant={createdByBadge.variant} />
                {placedByAdmin ? (
                  <p className="text-xs text-muted-foreground">{placedByAdmin}</p>
                ) : null}
              </div>
            </CrudDetailField>
            <CrudDetailField label={t.orderSource}>
              {order.source?.label || order.source?.value || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.deliveryFee}>
              {order.deliveryFeePrice != null ? (
                formatKwd(order.deliveryFeePrice)
              ) : (
                <EmptyValue label={t.notSet} />
              )}
            </CrudDetailField>
            <CrudDetailField label={t.total}>{formatKwd(order.totalPrice)}</CrudDetailField>
            <CrudDetailField label={t.totalWithDiscount}>
              {order.totalPriceWithDiscount != null ? (
                formatKwd(order.totalPriceWithDiscount)
              ) : (
                <EmptyValue label={t.notSet} />
              )}
            </CrudDetailField>
            <CrudDetailField label={t.totalWithTax}>
              {order.totalPriceWithTax != null ? (
                formatKwd(order.totalPriceWithTax)
              ) : (
                formatKwd(displayTotal)
              )}
            </CrudDetailField>
            <div className="sm:col-span-2">
              <CrudDetailField label={t.orderNote}>
                {order.note?.trim() ? (
                  <span className="whitespace-pre-wrap">{order.note}</span>
                ) : (
                  <EmptyValue label={t.notSet} />
                )}
              </CrudDetailField>
            </div>
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "items" ? (
        <CrudRecordSection title={t.orderItems} as="h2">
          <div className="space-y-3">
            {(order.items ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noData}</p>
            ) : (
              (order.items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.productTitle || t.product}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.quantity}: {item.quantity} · {formatKwd(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.subTotalPriceWithDiscount != null
                      ? formatKwd(item.subTotalPriceWithDiscount)
                      : formatKwd(item.subTotalPrice)}
                  </p>
                  {item.subTotalPriceWithDiscount != null ? (
                    <p className="w-full text-end text-xs text-muted-foreground line-through">
                      {formatKwd(item.subTotalPrice)}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "coupons" ? (
        <CrudRecordSection
          title={t.orderCoupons}
          description={t.orderViewCouponsHint}
          as="h2"
          dataGuidance={ORDER_FORM_ANCHORS.coupons}
        >
          {(order.couponCodes?.length ?? 0) > 0 ||
          (order.couponDiscounts?.length ?? 0) > 0 ||
          order.loyaltyRedemptionId != null ||
          (order.loyaltyDiscountPrice != null && order.loyaltyDiscountPrice > 0) ? (
            <div className="space-y-4">
              {(order.couponCodes?.length ?? 0) > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {(order.couponCodes ?? []).map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 font-mono text-xs font-semibold text-foreground"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              ) : null}
              {(order.couponDiscounts?.length ?? 0) > 0 ? (
                <ul className="space-y-1.5">
                  {(order.couponDiscounts ?? []).map((row, index) => {
                    const targetLabel =
                      row.target === "SHIPPING"
                        ? t.couponDiscountTargetShipping
                        : row.target === "GOODS"
                          ? t.couponDiscountTargetGoods
                          : row.target || t.notSet;
                    return (
                      <li
                        key={`${row.code ?? "coupon"}-${row.target ?? "target"}-${index}`}
                        className="text-sm text-foreground"
                      >
                        <span className="font-mono font-semibold">{row.code || t.notSet}</span>
                        {" −"}
                        {formatKwd(row.discount)}
                        <span className="text-muted-foreground"> ({targetLabel})</span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {order.loyaltyRedemptionId != null ||
              (order.loyaltyDiscountPrice != null && order.loyaltyDiscountPrice > 0) ? (
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="mb-2 text-sm font-semibold text-foreground">
                    {t.loyaltyOrderRedemption}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <CrudDetailField label={t.loyaltyOrderDiscount}>
                      {order.loyaltyDiscountPrice != null && order.loyaltyDiscountPrice > 0 ? (
                        formatKwd(order.loyaltyDiscountPrice)
                      ) : (
                        <EmptyValue label={t.notSet} />
                      )}
                    </CrudDetailField>
                    <CrudDetailField label="ID">
                      {order.loyaltyRedemptionId ?? order.loyaltyRedemption?.id ?? (
                        <EmptyValue label={t.notSet} />
                      )}
                    </CrudDetailField>
                    {order.loyaltyRedemption?.loyaltyReward ? (
                      <>
                        <CrudDetailField label={t.loyaltyRewardCode}>
                          <span className="font-mono text-sm">
                            {order.loyaltyRedemption.loyaltyReward.code || t.notSet}
                          </span>
                        </CrudDetailField>
                        <CrudDetailField label={t.name}>
                          {order.loyaltyRedemption.loyaltyReward.name || t.notSet}
                        </CrudDetailField>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.orderCouponsEmpty}</p>
          )}
        </CrudRecordSection>
      ) : null}

      {activeSection === "delivery" ? (
        <CrudRecordSection title={t.orderDelivery} as="h2">
          <div className="grid gap-4 sm:grid-cols-2">
            <CrudDetailField label={t.deliveryZonesPrices}>
              {order.deliveryZonePrice?.state?.title ||
                (order.deliveryZonePrice ? (
                  `#${order.deliveryZonePrice.id}`
                ) : (
                  <EmptyValue label={t.notSet} />
                ))}
            </CrudDetailField>
            <CrudDetailField label={t.deliveryFee}>
              {order.deliveryFeePrice != null ? (
                formatKwd(order.deliveryFeePrice)
              ) : (
                <EmptyValue label={t.notSet} />
              )}
            </CrudDetailField>
            <CrudDetailField label={t.addressTitle}>
              {order.address?.title || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.addressPhone}>
              <PhoneNumberText
                value={order.address?.phoneNumber}
                fallback={<EmptyValue label={t.notSet} />}
              />
            </CrudDetailField>
            <CrudDetailField label={t.street}>
              {order.address?.streetTitle || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.block}>
              {order.address?.block || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.building}>
              {order.address?.building || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.floor}>
              {order.address?.floorNumber || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.apartment}>
              {order.address?.apartment || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.landmark}>
              {order.address?.landmark || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
          </div>

          {hasOrderLocationCoords(order.address?.latitude, order.address?.longitude) ? (
            <div className="mt-6 space-y-3 border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-foreground">
                {t.orderLocationHeading}
              </h3>
              <OrderLocationMap
                latitude={order.address!.latitude!}
                longitude={order.address!.longitude!}
                customerAddress={[
                  order.address?.title,
                  order.address?.streetTitle,
                  order.address?.block,
                  order.address?.building,
                  order.address?.floorNumber,
                  order.address?.apartment,
                  order.address?.landmark,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            </div>
          ) : (
            <p className="mt-6 border-t border-border pt-6 text-sm text-muted-foreground">
              {t.orderLocationMissing}
            </p>
          )}
        </CrudRecordSection>
      ) : null}

      {activeSection === "invoice" ? (
        <CrudRecordSection title={t.invoice} as="h2">
          {order.invoice ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label="ID">{order.invoice.id}</CrudDetailField>
              <CrudDetailField label={t.invoiceNumber}>
                {invoiceNumber || <EmptyValue label={t.notSet} />}
              </CrudDetailField>
              <CrudDetailField label={t.invoiceStatus}>
                {order.invoice.status?.label ||
                  order.invoice.status?.value || <EmptyValue label={t.notSet} />}
              </CrudDetailField>
              <CrudDetailField label={t.payment}>
                {getOrderPaymentLabel(order, language === "ar" ? "ar" : "en") || (
                  <EmptyValue label={t.notSet} />
                )}
              </CrudDetailField>
              <CrudDetailField label={t.total}>
                {order.invoice.totalPrice != null ? (
                  formatKwd(order.invoice.totalPrice)
                ) : (
                  <EmptyValue label={t.notSet} />
                )}
              </CrudDetailField>
              <CrudDetailField label={t.currency}>
                {order.invoice.currencyCode ||
                  order.invoice.currency?.symbol || <EmptyValue label={t.notSet} />}
              </CrudDetailField>
              <CrudDetailField label={t.paidAt}>
                {order.invoice.paidAt ? (
                  formatDateTime(order.invoice.paidAt, language)
                ) : (
                  <EmptyValue label={t.notSet} />
                )}
              </CrudDetailField>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.notSet}</p>
          )}
        </CrudRecordSection>
      ) : null}
    </CrudRecordWorkspace>
  );
}
