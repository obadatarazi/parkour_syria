import { AlertTriangle, CreditCard, type LucideIcon, Package } from "lucide-react";
import { type ReactNode } from "react";
import { Link } from "react-router";

import { carePlanViewPath } from "@/app/router/routes";
import { useCarePlanWidgets } from "@/features/care-plans/hooks/use-care-plan-widgets";
import type {
  CarePlanAwaitingPaymentWidgetItem,
  CarePlanOutOfStockWidgetItem,
  CarePlanTopProductWidgetItem,
} from "@/features/care-plans/types/care-plans.types";
import {
  AppButton,
  AppCard,
  BodyText,
  CaptionText,
  EmptyState,
  ErrorState,
  SortableWidget,
  SortableWidgetLayout,
  StatCardSkeleton,
} from "@/shared/components";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { CARE_PLAN_GUIDANCE_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import { formatDeliveryDate } from "@/shared/lib/datetime.utils";

const PREVIEW_LIMIT = 5;

type WidgetListCardProps = {
  title: string;
  icon: LucideIcon;
  count: number;
  emptyTitle: string;
  children: ReactNode;
};

function WidgetListCard({ title, icon: Icon, count, emptyTitle, children }: WidgetListCardProps) {
  return (
    <AppCard padding="none" className="h-full overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 py-3.5 pe-5 ps-12">
        <h3 className="flex min-w-0 items-center gap-2.5 text-sm font-bold text-foreground">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <span className="truncate">{title}</span>
        </h3>
        <span className="rounded-full bg-brand-muted px-2 py-0.5 text-xs font-bold text-brand">
          {count}
        </span>
      </div>
      {count === 0 ? (
        <EmptyState
          title={emptyTitle}
          icon={<Icon className="size-6" aria-hidden="true" />}
          className="px-4 py-8"
        />
      ) : (
        <div className="divide-y divide-border/40">{children}</div>
      )}
    </AppCard>
  );
}

function AwaitingPaymentRows({ items }: { items: CarePlanAwaitingPaymentWidgetItem[] }) {
  const t = useTranslation();
  const { language } = useLocalization();
  const preview = items.slice(0, PREVIEW_LIMIT);

  return (
    <>
      {preview.map((item) => {
        const title =
          item.customerName?.trim() ||
          t.carePlanWidgetPlanId.replace("{id}", String(item.carePlanId));
        const delivery = item.scheduledFor
          ? formatDeliveryDate(item.scheduledFor, language)
          : t.notSet;

        return (
          <Link
            key={item.carePlanCycleId}
            to={carePlanViewPath(item.carePlanId)}
            className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0">
              <BodyText className="truncate font-semibold">{title}</BodyText>
              <CaptionText className="text-muted-foreground">
                {delivery}
                {item.frozenDiscountPercent != null ? ` · ${item.frozenDiscountPercent}%` : null}
              </CaptionText>
            </div>
            <CaptionText className="shrink-0 font-semibold text-brand">{t.viewAction}</CaptionText>
          </Link>
        );
      })}
    </>
  );
}

function OutOfStockRows({ items }: { items: CarePlanOutOfStockWidgetItem[] }) {
  const t = useTranslation();
  const preview = items.slice(0, PREVIEW_LIMIT);

  return (
    <>
      {preview.map((item, index) => {
        const title =
          item.productTitle?.trim() ||
          t.carePlanWidgetProductId.replace("{id}", String(item.productId));
        const variant = item.variantLabel?.trim();

        return (
          <Link
            key={`${item.carePlanId}-${item.productId}-${item.productVariantId ?? "base"}-${index}`}
            to={carePlanViewPath(item.carePlanId)}
            className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0">
              <BodyText className="truncate font-semibold">{title}</BodyText>
              <CaptionText className="text-muted-foreground">
                {variant ? `${variant} · ` : null}
                {t.carePlanWidgetStockNeed
                  .replace("{required}", String(item.requiredQuantity))
                  .replace("{available}", String(item.availableStock))}
              </CaptionText>
            </div>
            <CaptionText className="shrink-0 font-semibold text-brand">{t.viewAction}</CaptionText>
          </Link>
        );
      })}
    </>
  );
}

function TopProductRows({ items }: { items: CarePlanTopProductWidgetItem[] }) {
  const t = useTranslation();
  const preview = items.slice(0, PREVIEW_LIMIT);

  return (
    <>
      {preview.map((item) => {
        const title =
          item.productTitle?.trim() ||
          t.carePlanWidgetProductId.replace("{id}", String(item.productId));
        const variant = item.variantLabel?.trim();

        return (
          <div
            key={`${item.productId}-${item.productVariantId ?? "base"}`}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <BodyText className="truncate font-semibold">{title}</BodyText>
              <CaptionText className="text-muted-foreground">
                {variant ? `${variant} · ` : null}
                {t.carePlanWidgetTopProductMeta
                  .replace("{subscriptions}", String(item.subscriptionsCount))
                  .replace("{quantity}", String(item.totalQuantity))}
              </CaptionText>
            </div>
          </div>
        );
      })}
    </>
  );
}

export function CarePlanWidgets() {
  const t = useTranslation();
  const { data, isLoading, isError, error, refetch } = useCarePlanWidgets();

  if (isLoading) {
    return <StatCardSkeleton count={3} className="mb-6 sm:grid-cols-3 xl:grid-cols-3" />;
  }

  if (isError) {
    return (
      <div className="mb-6">
        <ErrorState
          title={t.errorStateDefaultTitle}
          description={resolveServiceErrorMessage(error, t)}
          action={
            <AppButton variant="outline" onClick={() => void refetch()}>
              {t.tryAgain}
            </AppButton>
          }
        />
      </div>
    );
  }

  const awaitingPayment = data?.awaitingPayment ?? [];
  const outOfStock = data?.outOfStock ?? [];
  const topProducts = data?.topProducts ?? [];

  return (
    <SortableWidgetLayout
      layoutId="care-plans-widgets"
      columns={3}
      className="mb-6 items-stretch"
      data-guidance={CARE_PLAN_GUIDANCE_ANCHORS.widgets}
    >
      <SortableWidget id="awaiting-payment-list" label={t.carePlanWidgetAwaitingPayment}>
        <WidgetListCard
          title={t.carePlanWidgetAwaitingPayment}
          icon={CreditCard}
          count={awaitingPayment.length}
          emptyTitle={t.carePlanWidgetAwaitingPaymentEmpty}
        >
          <AwaitingPaymentRows items={awaitingPayment} />
        </WidgetListCard>
      </SortableWidget>

      <SortableWidget id="out-of-stock-list" label={t.carePlanWidgetOutOfStock}>
        <WidgetListCard
          title={t.carePlanWidgetOutOfStock}
          icon={AlertTriangle}
          count={outOfStock.length}
          emptyTitle={t.carePlanWidgetOutOfStockEmpty}
        >
          <OutOfStockRows items={outOfStock} />
        </WidgetListCard>
      </SortableWidget>

      <SortableWidget id="top-products-list" label={t.carePlanWidgetTopProducts}>
        <WidgetListCard
          title={t.carePlanWidgetTopProducts}
          icon={Package}
          count={topProducts.length}
          emptyTitle={t.carePlanWidgetTopProductsEmpty}
        >
          <TopProductRows items={topProducts} />
        </WidgetListCard>
      </SortableWidget>
    </SortableWidgetLayout>
  );
}
