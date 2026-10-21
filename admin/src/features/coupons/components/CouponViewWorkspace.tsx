import {
  CalendarRange,
  Copy,
  History,
  Link2,
  Pencil,
  Target,
  TicketPercent,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { couponEditPath, ROUTES } from "@/app/router/routes";
import type { Coupon } from "@/features/coupons/types/coupons.types";
import { getCouponShareUrl } from "@/features/coupons/utils/coupon-share-url";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { AppButton, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudRecordSection, CrudRecordWorkspace } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { formatDateTime } from "@/shared/lib/datetime.utils";
import { notify } from "@/shared/lib/notifications";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

type CouponViewSectionId = "offer" | "audience" | "schedule" | "appliesTo" | "usage";

type CouponViewWorkspaceProps = {
  coupon: Coupon;
  canUpdate: boolean;
  canDelete: boolean;
  onBack: () => void;
  onDelete: () => void;
};

function statusVariant(
  value?: string | null,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (value) {
    case "ACTIVE":
      return "success";
    case "DRAFT":
      return "info";
    case "IN_ACTIVE":
      return "neutral";
    case "EXPIRED":
    case "REACH_THE_LIMIT":
      return "danger";
    default:
      return "warning";
  }
}

function formatCouponValue(coupon: Coupon, notSet: string): string {
  if (coupon.type?.value === "FREE_SHIPPING") return "—";
  if (!coupon.value) return notSet;
  if (coupon.type?.value === "PERCENTAGE") return `${coupon.value}%`;
  const amount = Number(coupon.value);
  return Number.isFinite(amount) ? formatKwd(amount) : coupon.value;
}

function EmptyValue({ label }: { label: string }) {
  return <span className="text-muted-foreground">{label}</span>;
}

export function CouponViewWorkspace({
  coupon,
  canUpdate,
  canDelete,
  onBack,
  onDelete,
}: CouponViewWorkspaceProps) {
  const t = useTranslation();
  const [activeSection, setActiveSection] = useState<CouponViewSectionId>("offer");

  const bilingual = getBilingualTitle(coupon.translations, coupon.title ?? coupon.code);
  const primaryLabel = formatBilingualLabel(bilingual) || coupon.code;
  const hasMinimumCartSpend =
    coupon.minimumTotalPrice != null &&
    Number.isFinite(coupon.minimumTotalPrice) &&
    coupon.minimumTotalPrice > 0;
  const shareUrl = coupon.couponUrl || getCouponShareUrl(coupon.code);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      notify.success(t.couponCodeCopied);
    } catch {
      notify.error(t.errorMessage);
    }
  };

  const copyUrl = async () => {
    if (!shareUrl || hasMinimumCartSpend) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      notify.success(t.couponUrlCopied);
    } catch {
      notify.error(t.errorMessage);
    }
  };

  const sectionItems: {
    id: CouponViewSectionId;
    label: string;
    icon: typeof TicketPercent;
  }[] = [
    { id: "offer", label: t.couponOfferSection, icon: TicketPercent },
    { id: "audience", label: t.couponRulesSection, icon: Users },
    { id: "schedule", label: t.couponAdvancedRules, icon: CalendarRange },
    { id: "appliesTo", label: t.couponAppliesToSection, icon: Target },
    { id: "usage", label: t.couponUsageSection, icon: History },
  ];

  return (
    <CrudRecordWorkspace
      breadcrumbHref={ROUTES.admin.coupons}
      breadcrumbLabel={t.coupons}
      title={coupon.code}
      subtitle={t.couponViewHint}
      meta={
        <>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {t.idLabel}: {coupon.id}
          </span>
          <StatusBadge
            label={coupon.status?.label || coupon.status?.value || t.notSet}
            variant={statusVariant(coupon.status?.value)}
          />
        </>
      }
      onBack={onBack}
      backLabel={t.backToCoupons}
      headerActions={
        <>
          <AppButton type="button" variant="outline" onClick={() => void copyCode()}>
            <Copy className="size-4" aria-hidden="true" />
            {t.copyCouponCode}
          </AppButton>
          {shareUrl ? (
            <AppButton
              type="button"
              variant="outline"
              onClick={() => void copyUrl()}
              disabled={hasMinimumCartSpend}
              title={hasMinimumCartSpend ? t.copyCouponUrlBlocked : t.copyCouponUrl}
            >
              <Link2 className="size-4" aria-hidden="true" />
              {t.copyCouponUrl}
            </AppButton>
          ) : null}
          {canDelete ? (
            <AppButton type="button" variant="outline" onClick={onDelete}>
              <Trash2 className="size-4" aria-hidden="true" />
              {t.deleteAction}
            </AppButton>
          ) : null}
          {canUpdate ? (
            <AppButton type="button" asChild>
              <Link to={couponEditPath(coupon)}>
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
      sectionsAriaLabel={t.couponFormSections}
      aside={
        <aside className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t.couponPreview}
            </p>
            <StatusBadge
              label={coupon.status?.label || coupon.status?.value || t.notSet}
              variant={statusVariant(coupon.status?.value)}
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground"
                aria-hidden="true"
              >
                <TicketPercent className="size-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="truncate font-mono text-base font-semibold tracking-wide text-foreground">
                  {coupon.code}
                </p>
                <p className="text-sm text-muted-foreground">{primaryLabel}</p>
                <p className="text-sm font-medium text-foreground">
                  {formatCouponValue(coupon, t.notSet)}
                  {coupon.type?.label ? ` · ${coupon.type.label}` : ""}
                </p>
              </div>
            </div>
          </div>
          {hasMinimumCartSpend ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
              {t.couponUrlMinSpendHint}
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 text-xs">
            <div>
              <p className="text-muted-foreground">{t.couponUsedCount}</p>
              <p className="mt-0.5 font-semibold text-foreground">
                {coupon.usageSummary?.usedCount ?? 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">{t.couponUsageRemaining}</p>
              <p className="mt-0.5 font-semibold text-foreground">
                {coupon.usageSummary?.remaining == null
                  ? t.couponUsageUnlimited
                  : coupon.usageSummary.remaining}
              </p>
            </div>
          </div>
        </aside>
      }
    >
      {activeSection === "offer" ? (
        <CrudRecordSection title={t.couponOfferSection} as="h2">
          <div className="grid gap-4 sm:grid-cols-2">
            <CrudDetailField label={t.couponCode}>{coupon.code}</CrudDetailField>
            <CrudDetailField label={t.couponType}>
              {coupon.type?.label || coupon.type?.value || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <div className="sm:col-span-2">
              <CrudDetailField label={t.couponUrl}>
                {shareUrl ? (
                  <div className="space-y-1">
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-brand hover:underline"
                    >
                      {shareUrl}
                    </a>
                    {hasMinimumCartSpend ? (
                      <p className="text-xs text-muted-foreground">{t.couponUrlMinSpendHint}</p>
                    ) : null}
                  </div>
                ) : (
                  <EmptyValue label={t.notSet} />
                )}
              </CrudDetailField>
            </div>
            <CrudDetailField label={t.couponValue}>
              {formatCouponValue(coupon, t.notSet)}
            </CrudDetailField>
            <CrudDetailField label={t.titleEnglish}>
              {bilingual.en?.trim() || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.titleArabic}>
              {bilingual.ar?.trim() ? (
                <span dir="rtl">{bilingual.ar}</span>
              ) : (
                <EmptyValue label={t.notSet} />
              )}
            </CrudDetailField>
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "audience" ? (
        <CrudRecordSection
          title={t.couponRulesSection}
          description={t.couponRulesSectionHint}
          as="h2"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <CrudDetailField label={t.couponAudience}>
              {coupon.audience?.label || coupon.audience?.value || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.couponIsAutoApply}>
              {coupon.isAutoApply ? t.active : t.inactive}
            </CrudDetailField>
            <CrudDetailField label={t.couponIsFirstOrderOnly}>
              {coupon.isFirstOrderOnly ? t.active : t.inactive}
            </CrudDetailField>
            <CrudDetailField label={t.couponRequireLogin}>
              {coupon.isRequireLogin ? t.active : t.inactive}
            </CrudDetailField>
            <CrudDetailField label={t.couponIsAdminOnly}>
              {coupon.isAdminOnly ? t.active : t.inactive}
            </CrudDetailField>
            {(coupon.users?.length ?? 0) > 0 ? (
              <div className="sm:col-span-2">
                <CrudDetailField label={t.couponUsers}>
                  {coupon.users
                    ?.map((user) => user.name || user.email || `#${user.userId}`)
                    .join(", ")}
                </CrudDetailField>
              </div>
            ) : null}
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "schedule" ? (
        <CrudRecordSection title={t.couponAdvancedRules} as="h2">
          <div className="grid gap-4 sm:grid-cols-2">
            <CrudDetailField label={t.status}>
              <StatusBadge
                label={coupon.status?.label || coupon.status?.value || t.notSet}
                variant={statusVariant(coupon.status?.value)}
              />
            </CrudDetailField>
            <CrudDetailField label={t.couponMinimumTotalPrice}>
              {coupon.minimumTotalPrice != null ? (
                formatKwd(coupon.minimumTotalPrice)
              ) : (
                <EmptyValue label={t.notSet} />
              )}
            </CrudDetailField>
            <CrudDetailField label={t.couponStartsAt}>
              {coupon.startsAt ? formatDateTime(coupon.startsAt) : <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.couponExpireAt}>
              {coupon.expireAt ? formatDateTime(coupon.expireAt) : <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.couponUsageLimit}>
              {coupon.usageLimit ?? <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.couponUsageLimitPerUser}>
              {coupon.usageLimitPerUser ?? <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.couponPriority}>
              {coupon.priority ?? <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.couponIsCombinable}>
              {coupon.isCombinable ? t.active : t.inactive}
            </CrudDetailField>
            <CrudDetailField label={t.couponNotifyUsers}>
              {coupon.isNotifyUsers ? t.active : t.inactive}
            </CrudDetailField>
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "appliesTo" ? (
        <CrudRecordSection title={t.couponAppliesToSection} as="h2">
          <div className="space-y-3">
            <CrudDetailField label={t.couponScope}>
              {coupon.scope?.label || coupon.scope?.value || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            {coupon.scope?.value === "SHIPPING" || coupon.type?.value === "FREE_SHIPPING" ? (
              <p className="text-sm text-muted-foreground">
                {(coupon.products?.length ?? 0) > 0 ||
                (coupon.productVariants?.length ?? 0) > 0 ||
                (coupon.brands?.length ?? 0) > 0 ||
                (coupon.categories?.length ?? 0) > 0 ||
                (coupon.tags?.length ?? 0) > 0
                  ? t.couponShippingCatalogOptionalHint
                  : t.couponAppliesToShippingNote}
              </p>
            ) : coupon.scope?.value === "CART" ||
              ((coupon.products?.length ?? 0) === 0 &&
                (coupon.productVariants?.length ?? 0) === 0 &&
                (coupon.brands?.length ?? 0) === 0 &&
                (coupon.categories?.length ?? 0) === 0 &&
                (coupon.tags?.length ?? 0) === 0) ? (
              <p className="text-sm text-muted-foreground">{t.couponAppliesToWholeCartNote}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{t.couponAppliesToOrHint}</p>
            )}
            {(coupon.products?.length ?? 0) > 0 ? (
              <CrudDetailField label={t.products}>
                {coupon.products?.map((item) => item.title || `#${item.id}`).join(", ")}
              </CrudDetailField>
            ) : null}
            {(coupon.productVariants?.length ?? 0) > 0 ? (
              <CrudDetailField label={t.variants}>
                {coupon.productVariants
                  ?.map((item) => item.skuCode || item.title || `#${item.id}`)
                  .join(", ")}
              </CrudDetailField>
            ) : null}
            {(coupon.brands?.length ?? 0) > 0 ? (
              <CrudDetailField label={t.brands}>
                {coupon.brands?.map((item) => item.title || `#${item.id}`).join(", ")}
              </CrudDetailField>
            ) : null}
            {(coupon.categories?.length ?? 0) > 0 ? (
              <CrudDetailField label={t.categories}>
                {coupon.categories?.map((item) => item.title || `#${item.id}`).join(", ")}
              </CrudDetailField>
            ) : null}
            {(coupon.tags?.length ?? 0) > 0 ? (
              <CrudDetailField label={t.tags}>
                {coupon.tags?.map((item) => item.title || `#${item.id}`).join(", ")}
              </CrudDetailField>
            ) : null}
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "usage" ? (
        <CrudRecordSection title={t.couponUsageSection} as="h2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.couponUsedCount}>
                {coupon.usageSummary?.usedCount ?? 0}
              </CrudDetailField>
              <CrudDetailField label={t.couponUsageRemaining}>
                {coupon.usageSummary?.remaining == null
                  ? t.couponUsageUnlimited
                  : coupon.usageSummary.remaining}
              </CrudDetailField>
              <CrudDetailField label={t.couponUsageLimit}>
                {coupon.usageSummary?.usageLimit ?? coupon.usageLimit ?? (
                  <EmptyValue label={t.notSet} />
                )}
              </CrudDetailField>
              <CrudDetailField label={t.couponTotalDiscountGiven}>
                {formatKwd(coupon.usageSummary?.totalDiscountGiven ?? 0)}
              </CrudDetailField>
            </div>
            {(coupon.usages?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.couponUsageHistory}
                </p>
                <ul className="space-y-2">
                  {(coupon.usages ?? []).map((usage) => (
                    <li
                      key={usage.id}
                      className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-foreground">
                          {usage.userName || usage.userEmail || usage.cartUuid || t.guest}
                        </span>
                        <span className="font-semibold text-foreground">
                          −{formatKwd(usage.discountPrice)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[
                          usage.orderRefNumber ? `${t.orderNum} ${usage.orderRefNumber}` : null,
                          usage.usedAt ? formatDateTime(usage.usedAt) : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || t.notSet}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.couponUsageEmpty}</p>
            )}
          </div>
        </CrudRecordSection>
      ) : null}
    </CrudRecordWorkspace>
  );
}
