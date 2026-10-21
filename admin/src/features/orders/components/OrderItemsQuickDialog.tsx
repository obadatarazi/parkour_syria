import { Link } from "react-router";

import { productViewPath } from "@/app/router/routes";
import { orderItemsService } from "@/features/order-items/services/order-items.service";
import type { Order } from "@/features/orders/types/orders.types";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { AppDrawer } from "@/shared/components";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

type OrderItemsQuickDialogProps = {
  open: boolean;
  order: Pick<Order, "id" | "orderRefNumber"> | null;
  onOpenChange: (open: boolean) => void;
};

export function OrderItemsQuickDialog({
  open,
  order,
  onOpenChange,
}: OrderItemsQuickDialogProps) {
  const t = useTranslation();
  const orderRefNumber = order?.orderRefNumber?.trim() || "";

  const { data, isLoading, isError, error, refetch } = useCrudQuery({
    queryKey: ["order-items", "by-ref", orderRefNumber],
    queryFn: (signal) =>
      orderItemsService.list(
        {
          orderRefNumber,
          page: 1,
          limit: 100,
          sort: "id",
          direction: "asc",
        },
        signal,
      ),
    enabled: open && Boolean(orderRefNumber),
  });

  const items = data?.data ?? [];
  const titleRef = orderRefNumber || (order ? `#${order.id}` : "");

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t.orderItems}
      description={titleRef}
      size="md"
    >
      {!orderRefNumber ? (
        <p className="text-sm text-muted-foreground">{t.noData}</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
      ) : isError ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">
            {resolveServiceErrorMessage(error, t)}
          </p>
          <button
            type="button"
            className="text-sm font-medium text-brand hover:underline"
            onClick={() => void refetch()}
          >
            {t.tryAgain}
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.noData}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const productId = item.productId ?? item.product?.id;
            const productHref = productId
              ? productViewPath(String(productId))
              : null;
            const productLabel =
              item.productTitle || item.product?.title || t.product;

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
                      onClick={() => onOpenChange(false)}
                    >
                      {productLabel}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-foreground">{productLabel}</p>
                  )}
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
            );
          })}
        </div>
      )}
    </AppDrawer>
  );
}
