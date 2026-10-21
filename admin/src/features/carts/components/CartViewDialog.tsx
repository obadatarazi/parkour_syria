import type { AdminCart } from "@/features/carts/types/carts.types";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type CartViewDialogProps = {
  open: boolean;
  cart: AdminCart | null;
  onOpenChange: (open: boolean) => void;
};

export function CartViewDialog({ open, cart, onOpenChange }: CartViewDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();

  if (!cart) return null;

  const customerLabel =
    cart.user?.fullName ||
    cart.user?.email ||
    cart.user?.phoneNumber ||
    (cart.guest ? t.cartGuest : t.notSet);

  const items = cart.items ?? [];
  const orders = cart.orders ?? [];

  const sections: CrudViewDialogSection[] = [
    {
      id: "details",
      title: t.viewDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{cart.id}</CrudDetailField>
          <CrudDetailField label={t.cartUuid}>{cart.cartUuid || t.notSet}</CrudDetailField>
          <CrudDetailField label={t.customer}>{customerLabel}</CrudDetailField>
          <CrudDetailField label={t.cartConversionStatus}>
            {cart.conversionStatus === "CONVERTED" ? t.cartConverted : t.cartAbandoned}
          </CrudDetailField>
          <CrudDetailField label={t.orders}>{cart.ordersCount}</CrudDetailField>
          <CrudDetailField label={t.cartProductsInCart}>{cart.purchasedItemsCount}</CrudDetailField>
          <CrudDetailField label={t.updatedAt}>
            {cart.updatedAt ? formatDateTime(cart.updatedAt, language) : t.notSet}
          </CrudDetailField>
        </div>
      ),
    },
    {
      id: "items",
      title: t.cartProductsInCart,
      content:
        items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.cartNoProductsInCart}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate font-medium">
                  {item.productTitle || t.notSet}
                  <span className="ms-2 text-muted-foreground">×{item.quantity}</span>
                </span>
                <span className="shrink-0 font-semibold text-brand">
                  {formatKwd(item.subTotalPrice)}
                </span>
              </li>
            ))}
          </ul>
        ),
    },
    {
      id: "orders",
      title: t.cartOrdersFromCart,
      content:
        orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.cartNoOrdersFromCart}</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-sm font-semibold">{order.orderRefNumber}</p>
                  <p className="text-sm font-semibold text-brand">
                    {order.totalPriceWithTax == null ? "—" : formatKwd(order.totalPriceWithTax)}
                  </p>
                </div>
                <p className="mb-2 text-xs text-muted-foreground">
                  {order.status}
                  {order.createdAt
                    ? ` · ${formatDateTime(order.createdAt, language === "ar" ? "ar" : "en")}`
                    : ""}
                </p>
                <ul className="space-y-1">
                  {(order.items ?? []).map((item) => (
                    <li key={item.id} className="text-sm text-muted-foreground">
                      {item.productTitle || t.notSet} ×{item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={cart}
      onOpenChange={onOpenChange}
      title={t.cartDetails}
      cancelLabel={t.close}
      hero={
        <div className="space-y-1">
          <p className="font-mono text-lg font-semibold tracking-wide">
            {cart.cartUuid || `#${cart.id}`}
          </p>
          <p className="text-sm text-muted-foreground">{customerLabel}</p>
        </div>
      }
      sections={sections}
    />
  );
}
