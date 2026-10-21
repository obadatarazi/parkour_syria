import { Link } from "react-router";

import type { OrderItem } from "@/features/order-items/types/order-items.types";
import {
  orderItemOrderHref,
  orderItemProductHref,
} from "@/features/order-items/utils/order-item-links";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type OrderItemViewDialogProps = {
  open: boolean;
  orderItem: OrderItem | null;
  onOpenChange: (open: boolean) => void;
};

export function OrderItemViewDialog({
  open,
  orderItem,
  onOpenChange,
}: OrderItemViewDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();

  if (!orderItem) return null;

  const orderHref = orderItemOrderHref(orderItem);
  const productHref = orderItemProductHref(orderItem);
  const orderLabel =
    orderItem.orderRefNumber || (orderItem.orderId ? `#${orderItem.orderId}` : t.notSet);
  const productLabel =
    orderItem.productTitle?.trim() ||
    orderItem.product?.title?.trim() ||
    (orderItem.productId ? `#${orderItem.productId}` : t.notSet);

  const sections: CrudViewDialogSection[] = [
    {
      id: "details",
      title: t.orderItemDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{orderItem.id}</CrudDetailField>
          <CrudDetailField label={t.orderNum}>
            {orderHref ? (
              <Link to={orderHref} className="font-mono text-brand hover:underline">
                {orderLabel}
              </Link>
            ) : (
              orderLabel
            )}
          </CrudDetailField>
          <CrudDetailField label={t.product}>
            {productHref ? (
              <Link to={productHref} className="text-brand hover:underline">
                {productLabel}
              </Link>
            ) : (
              productLabel
            )}
          </CrudDetailField>
          <CrudDetailField label={t.productVariantId}>
            {orderItem.productVariantId ?? t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.price}>{formatKwd(orderItem.price)}</CrudDetailField>
          <CrudDetailField label={t.quantity}>{orderItem.quantity}</CrudDetailField>
          <CrudDetailField label={t.subtotal}>
            {formatKwd(orderItem.subTotalPrice)}
          </CrudDetailField>
          <CrudDetailField label={t.totalWithDiscount}>
            {orderItem.subTotalPriceWithDiscount != null
              ? formatKwd(orderItem.subTotalPriceWithDiscount)
              : t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.date}>
            {formatDateTime(orderItem.createdAt, language)}
          </CrudDetailField>
          <CrudDetailField label={t.updatedAt}>
            {formatDateTime(orderItem.updatedAt, language)}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={orderItem}
      onOpenChange={onOpenChange}
      title={t.viewOrderItem}
      cancelLabel={t.cancel}
      canUpdate={false}
      canDelete={false}
      sections={sections}
      hero={
        <div className="space-y-3">
          <p className="text-lg font-semibold text-foreground">{productLabel}</p>
          <p className="font-mono text-sm text-brand">{orderLabel}</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={`${t.quantity}: ${orderItem.quantity}`}
              variant="neutral"
            />
            <StatusBadge label={formatKwd(orderItem.subTotalPrice)} variant="info" />
          </div>
        </div>
      }
    />
  );
}
