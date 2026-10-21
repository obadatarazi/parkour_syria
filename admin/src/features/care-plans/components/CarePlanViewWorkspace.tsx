import {
  Ban,
  HeartPulse,
  History,
  Package,
  Pause,
  Pencil,
  Percent,
  Play,
  SkipForward,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { carePlanEditPath, orderViewPath, ROUTES } from "@/app/router/routes";
import type { CarePlan, CarePlanCycle } from "@/features/care-plans/types/care-plans.types";
import { getCarePlanCustomerLabel } from "@/features/care-plans/types/care-plans.types";
import {
  getCarePlanItemTitle,
  getCarePlanItemVariantLabel,
} from "@/features/care-plans/utils/care-plan-display.utils";
import { AppButton, ConfirmDialog, PhoneNumberText, StatusBadge, UserLabelText } from "@/shared/components";
import { CrudDetailField, CrudRecordSection, CrudRecordWorkspace } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { CARE_PLAN_GUIDANCE_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import { useCarePlanPreferredWeekdayOptions } from "@/shared/hooks/use-options";
import { formatDateTime, formatDeliveryDate } from "@/shared/lib/datetime.utils";

type CarePlanViewSectionId = "overview" | "discounts" | "items" | "cycles" | "lifecycle";

function formatMoney(value: number): string {
  return Number(value).toFixed(3);
}

type CarePlanViewWorkspaceProps = {
  carePlan: CarePlan;
  canUpdate: boolean;
  canDelete: boolean;
  isLifecyclePending?: boolean;
  isSkippingCycle?: boolean;
  onBack: () => void;
  onDelete: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancelPlan: () => void;
  onSkipCycle: (cycle: CarePlanCycle) => void;
};

function statusVariant(
  value?: string | null,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (value) {
    case "ACTIVE":
      return "success";
    case "PAUSED":
      return "warning";
    case "CANCELLED":
      return "danger";
    default:
      return "neutral";
  }
}

function cycleStatusVariant(
  value?: string | null,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (value) {
    case "ORDERED":
      return "success";
    case "SCHEDULED":
      return "info";
    case "AWAITING_PAYMENT":
      return "warning";
    case "SKIPPED":
    case "CANCELLED":
      return "neutral";
    case "FAILED":
      return "danger";
    default:
      return "neutral";
  }
}

function EmptyValue({ label }: { label: string }) {
  return <span className="text-muted-foreground">{label}</span>;
}

export function CarePlanViewWorkspace({
  carePlan,
  canUpdate,
  canDelete,
  isLifecyclePending = false,
  isSkippingCycle = false,
  onBack,
  onDelete,
  onPause,
  onResume,
  onCancelPlan,
  onSkipCycle,
}: CarePlanViewWorkspaceProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const [activeSection, setActiveSection] = useState<CarePlanViewSectionId>("overview");
  const [confirmAction, setConfirmAction] = useState<"pause" | "resume" | "cancel" | null>(null);
  const [skipCycle, setSkipCycle] = useState<CarePlanCycle | null>(null);
  const { options: weekdayOptions } = useCarePlanPreferredWeekdayOptions();
  const preferredWeekdayLabel =
    carePlan.preferredWeekday == null
      ? t.notSet
      : (weekdayOptions.find((option) => Number(option.value) === carePlan.preferredWeekday)?.label ??
        t.notSet);

  const statusValue = carePlan.status?.value;
  const customerLabel = getCarePlanCustomerLabel(carePlan, t.notSet);

  const sectionItems: {
    id: CarePlanViewSectionId;
    label: string;
    icon: typeof HeartPulse;
  }[] = [
    { id: "overview", label: t.carePlanOverviewSection, icon: HeartPulse },
    { id: "discounts", label: t.carePlanDiscountsSection, icon: Percent },
    { id: "items", label: t.carePlanItemsSection, icon: Package },
    { id: "cycles", label: t.carePlanCyclesSection, icon: History },
    { id: "lifecycle", label: t.carePlanLifecycleSection, icon: Pause },
  ];

  const paymentProviderTitle =
    carePlan.paymentProvider?.title?.trim() ||
    (carePlan.paymentProviderId ? `#${carePlan.paymentProviderId}` : t.notSet);

  const addressTitle =
    carePlan.userAddress?.title?.trim() ||
    (carePlan.userAddressId ? `#${carePlan.userAddressId}` : t.notSet);

  return (
    <>
      <CrudRecordWorkspace
        breadcrumbHref={ROUTES.admin.carePlans}
        breadcrumbLabel={t.carePlans}
        title={customerLabel}
        subtitle={t.carePlanViewHint}
        workspaceGuidance={CARE_PLAN_GUIDANCE_ANCHORS.viewWorkspace}
        meta={
          <>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {t.idLabel}: {carePlan.id}
            </span>
            <StatusBadge
              label={carePlan.status?.label || carePlan.status?.value || t.notSet}
              variant={statusVariant(statusValue)}
            />
          </>
        }
        onBack={onBack}
        backLabel={t.backToCarePlans}
        headerActions={
          <>
            {canDelete ? (
              <AppButton type="button" variant="outline" onClick={onDelete}>
                <Trash2 className="size-4" aria-hidden="true" />
                {t.carePlanCancelAction}
              </AppButton>
            ) : null}
            {canUpdate ? (
              <AppButton type="button" asChild>
                <Link to={carePlanEditPath(carePlan.id)}>
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
        sectionsAriaLabel={t.carePlanFormSections}
        aside={
          <aside className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t.carePlanDiscountSummary}
              </p>
              <StatusBadge
                label={carePlan.status?.label || carePlan.status?.value || t.notSet}
                variant={statusVariant(statusValue)}
              />
            </div>
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">{t.carePlanCurrentDiscount}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                {carePlan.currentDiscountPercent}%
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {t.carePlanDiscountBreakdown
                  .replace("{current}", String(carePlan.currentDiscountPercent))
                  .replace("{initial}", String(carePlan.initialDiscountPercent))
                  .replace("{loyalty}", String(carePlan.loyaltyDiscountPercent))
                  .replace("{cycles}", String(carePlan.completedCyclesCount))}
              </p>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">{t.carePlanFrequency}</dt>
                <dd className="font-medium">
                  {carePlan.frequency?.label || carePlan.frequency?.value || t.notSet}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">{t.carePlanNextDelivery}</dt>
                <dd className="font-medium">
                  {carePlan.nextDeliveryAt
                    ? formatDeliveryDate(carePlan.nextDeliveryAt, language)
                    : t.notSet}
                </dd>
              </div>
            </dl>
          </aside>
        }
      >
        {activeSection === "overview" ? (
          <CrudRecordSection
            title={t.carePlanOverviewSection}
            description={t.carePlanOverviewSectionHint}
            as="h2"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.carePlanCustomer}>
                <div className="space-y-0.5">
                  <p className="font-medium">
                    <UserLabelText value={customerLabel} />
                  </p>
                  {carePlan.user?.email ? (
                    <p className="text-xs text-muted-foreground">{carePlan.user.email}</p>
                  ) : null}
                  {carePlan.user?.phoneNumber ? (
                    <p className="text-xs text-muted-foreground">
                      <PhoneNumberText value={carePlan.user.phoneNumber} />
                    </p>
                  ) : null}
                </div>
              </CrudDetailField>
              <CrudDetailField label={t.carePlanAddress}>{addressTitle}</CrudDetailField>
              <CrudDetailField label={t.carePlanPaymentProvider}>
                {paymentProviderTitle}
              </CrudDetailField>
              <CrudDetailField label={t.carePlanFrequency}>
                {carePlan.frequency?.label || carePlan.frequency?.value || (
                  <EmptyValue label={t.notSet} />
                )}
              </CrudDetailField>
              <CrudDetailField label={t.carePlanPreferredWeekday}>
                {preferredWeekdayLabel}
              </CrudDetailField>
              <CrudDetailField label={t.status}>
                <StatusBadge
                  label={carePlan.status?.label || carePlan.status?.value || t.notSet}
                  variant={statusVariant(statusValue)}
                />
              </CrudDetailField>
              <CrudDetailField label={t.carePlanNextDelivery}>
                {carePlan.nextDeliveryAt
                  ? formatDeliveryDate(carePlan.nextDeliveryAt, language)
                  : t.notSet}
              </CrudDetailField>
              <CrudDetailField label={t.carePlanMissedPayments}>
                {carePlan.missedPaymentCount}
              </CrudDetailField>
              <CrudDetailField label={t.carePlanStartedAt}>
                {carePlan.startedAt ? formatDateTime(carePlan.startedAt, language) : t.notSet}
              </CrudDetailField>
              <CrudDetailField label={t.carePlanPausedAt}>
                {carePlan.pausedAt ? formatDateTime(carePlan.pausedAt, language) : t.notSet}
              </CrudDetailField>
              <CrudDetailField label={t.carePlanCancelAt}>
                {carePlan.cancelAt ? formatDateTime(carePlan.cancelAt, language) : t.notSet}
              </CrudDetailField>
              <CrudDetailField label={t.carePlanCreatedAt}>
                {carePlan.createdAt ? formatDateTime(carePlan.createdAt, language) : t.notSet}
              </CrudDetailField>
            </div>
          </CrudRecordSection>
        ) : null}

        {activeSection === "discounts" ? (
          <CrudRecordSection
            title={t.carePlanDiscountsSection}
            description={t.carePlanDiscountsSectionHint}
            as="h2"
          >
            <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t.carePlanInitialDiscount}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{carePlan.initialDiscountPercent}%</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.carePlanInitialDiscountHint}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t.carePlanLoyaltyDiscount}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{carePlan.loyaltyDiscountPercent}%</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.carePlanLoyaltyDiscountHint}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t.carePlanCompletedCycles}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{carePlan.completedCyclesCount}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.carePlanCompletedCyclesHint}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  {t.carePlanCurrentDiscount}
                </p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">
                  {carePlan.currentDiscountPercent}%
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.carePlanCurrentDiscountFormula
                    .replace("{current}", String(carePlan.currentDiscountPercent))
                    .replace("{initial}", String(carePlan.initialDiscountPercent))
                    .replace("{loyalty}", String(carePlan.loyaltyDiscountPercent))}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">{t.carePlanDiscountRulesNote}</p>
            </div>
          </CrudRecordSection>
        ) : null}

        {activeSection === "items" ? (
          <CrudRecordSection
            title={t.carePlanItemsSection}
            description={t.carePlanItemsSectionHint}
            as="h2"
          >
            {(carePlan.items ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noData}</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/40 text-start text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">{t.product}</th>
                      <th className="px-3 py-2 font-medium">{t.carePlanVariant}</th>
                      <th className="px-3 py-2 font-medium">{t.quantity}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(carePlan.items ?? []).map((item) => (
                      <tr key={item.id ?? `${item.productId}-${item.productVariantId}`} className="border-t border-border">
                        <td className="px-3 py-2">
                          {getCarePlanItemTitle(item, t.notSet)}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {getCarePlanItemVariantLabel(item) ?? t.notSet}
                        </td>
                        <td className="px-3 py-2">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CrudRecordSection>
        ) : null}

        {activeSection === "cycles" ? (
          <div className="space-y-6">
            {carePlan.nextCycleTotals ? (
              <CrudRecordSection
                title={t.carePlanNextCycleTotals}
                description={t.carePlanNextCycleTotalsHint}
                as="h2"
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <CrudDetailField label={t.carePlanSubtotal}>
                    {formatMoney(carePlan.nextCycleTotals.subtotal)}
                  </CrudDetailField>
                  <CrudDetailField label={t.carePlanDiscountAmount}>
                    {formatMoney(carePlan.nextCycleTotals.discountAmount)} (
                    {carePlan.nextCycleTotals.discountPercent}%)
                  </CrudDetailField>
                  <CrudDetailField label={t.carePlanDeliveryFee}>
                    {formatMoney(carePlan.nextCycleTotals.deliveryFee)}
                  </CrudDetailField>
                  <CrudDetailField label={t.carePlanTaxAmount}>
                    {formatMoney(carePlan.nextCycleTotals.taxAmount)}
                  </CrudDetailField>
                  <CrudDetailField label={t.carePlanEstimatedTotal}>
                    <span className="text-lg font-semibold">
                      {formatMoney(carePlan.nextCycleTotals.total)}
                    </span>
                  </CrudDetailField>
                </div>
              </CrudRecordSection>
            ) : null}

            <CrudRecordSection
              title={t.carePlanUpcomingCycles}
              description={t.carePlanUpcomingCyclesHint}
              as="h2"
            >
              {(carePlan.upcomingCycles ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.noData}</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/40 text-start text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">{t.carePlanCycleNumber}</th>
                        <th className="px-3 py-2 font-medium">{t.carePlanScheduledFor}</th>
                        <th className="px-3 py-2 font-medium">{t.status}</th>
                        <th className="px-3 py-2 font-medium">{t.loyaltyDiscount}</th>
                        <th className="px-3 py-2 font-medium">{t.carePlanEstimatedTotal}</th>
                        <th className="px-3 py-2 font-medium">{t.carePlanOrderRef}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(carePlan.upcomingCycles ?? []).map((cycle) => (
                        <tr
                          key={`${cycle.cycleId ?? "preview"}-${cycle.cycleNumber}`}
                          className="border-t border-border align-top"
                        >
                          <td className="px-3 py-2 font-medium">
                            <div className="flex flex-wrap items-center gap-2">
                              <span>#{cycle.cycleNumber}</span>
                              {cycle.isCurrent ? (
                                <StatusBadge label={t.carePlanCurrentCycle} variant="info" />
                              ) : null}
                              {cycle.isPreview ? (
                                <StatusBadge label={t.carePlanPreviewCycle} variant="neutral" />
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            {cycle.scheduledFor ? formatDeliveryDate(cycle.scheduledFor, language) : t.notSet}
                          </td>
                          <td className="px-3 py-2">
                            {cycle.status ? (
                              <StatusBadge
                                label={cycle.status.label || cycle.status.value || t.notSet}
                                variant={cycleStatusVariant(cycle.status.value)}
                              />
                            ) : (
                              <span className="text-muted-foreground">{t.notSet}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">{cycle.discountPercent}%</td>
                          <td className="px-3 py-2 font-medium">
                            {formatMoney(cycle.estimatedTotal)}
                          </td>
                          <td className="px-3 py-2">
                            {cycle.orderRefNumber ? (
                              <span>{cycle.orderRefNumber}</span>
                            ) : (
                              <span className="text-muted-foreground">{t.notSet}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CrudRecordSection>

            <CrudRecordSection
              title={t.carePlanCyclesSection}
              description={t.carePlanCyclesSectionHint}
              as="h2"
            >
              {(carePlan.cycles ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.noData}</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/40 text-start text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">{t.carePlanCycleNumber}</th>
                        <th className="px-3 py-2 font-medium">{t.carePlanScheduledFor}</th>
                        <th className="px-3 py-2 font-medium">{t.carePlanCutoffAt}</th>
                        <th className="px-3 py-2 font-medium">{t.carePlanPaymentClosesAt}</th>
                        <th className="px-3 py-2 font-medium">{t.status}</th>
                        <th className="px-3 py-2 font-medium">{t.carePlanFrozenDiscount}</th>
                        <th className="px-3 py-2 font-medium">{t.carePlanOrderRef}</th>
                        <th className="px-3 py-2 font-medium">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(carePlan.cycles ?? []).map((cycle) => (
                        <tr key={cycle.id} className="border-t border-border align-top">
                          <td className="px-3 py-2 font-medium">#{cycle.cycleNumber}</td>
                          <td className="px-3 py-2">
                            {cycle.scheduledFor ? formatDeliveryDate(cycle.scheduledFor, language) : t.notSet}
                          </td>
                          <td className="px-3 py-2">
                            {cycle.cutoffAt ? formatDateTime(cycle.cutoffAt, language) : t.notSet}
                          </td>
                          <td className="px-3 py-2">
                            {cycle.paymentClosesAt
                              ? formatDateTime(cycle.paymentClosesAt, language)
                              : t.notSet}
                          </td>
                          <td className="px-3 py-2">
                            <StatusBadge
                              label={cycle.status?.label || cycle.status?.value || t.notSet}
                              variant={cycleStatusVariant(cycle.status?.value)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            {cycle.frozenDiscountPercent != null
                              ? `${cycle.frozenDiscountPercent}%`
                              : t.notSet}
                          </td>
                          <td className="px-3 py-2">
                            <div className="space-y-1">
                              {cycle.orderId ? (
                                <Link
                                  to={orderViewPath(cycle.orderRefNumber ?? String(cycle.orderId))}
                                  className="font-medium text-primary hover:underline"
                                >
                                  {cycle.orderRefNumber || `#${cycle.orderId}`}
                                </Link>
                              ) : (
                                <span className="text-muted-foreground">{t.notSet}</span>
                              )}
                              {cycle.paymentUrl ? (
                                <a
                                  href={cycle.paymentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block text-xs text-primary hover:underline"
                                >
                                  {t.carePlanPaymentUrl}
                                </a>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            {canUpdate && cycle.status?.value === "SCHEDULED" ? (
                              <AppButton
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={isSkippingCycle}
                                onClick={() => setSkipCycle(cycle)}
                              >
                                <SkipForward className="size-3.5" aria-hidden="true" />
                                {t.carePlanSkipCycle}
                              </AppButton>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CrudRecordSection>
          </div>
        ) : null}

        {activeSection === "lifecycle" ? (
          <CrudRecordSection
            title={t.carePlanLifecycleSection}
            description={t.carePlanLifecycleSectionHint}
            as="h2"
            dataGuidance={CARE_PLAN_GUIDANCE_ANCHORS.lifecycle}
          >
            <div className="flex flex-wrap gap-3">
              {canUpdate && statusValue === "ACTIVE" ? (
                <AppButton
                  type="button"
                  variant="outline"
                  disabled={isLifecyclePending}
                  onClick={() => setConfirmAction("pause")}
                >
                  <Pause className="size-4" aria-hidden="true" />
                  {t.carePlanPauseAction}
                </AppButton>
              ) : null}
              {canUpdate && statusValue === "PAUSED" ? (
                <AppButton
                  type="button"
                  disabled={isLifecyclePending}
                  onClick={() => setConfirmAction("resume")}
                >
                  <Play className="size-4" aria-hidden="true" />
                  {t.carePlanResumeAction}
                </AppButton>
              ) : null}
              {canUpdate && statusValue !== "CANCELLED" ? (
                <AppButton
                  type="button"
                  variant="destructive"
                  disabled={isLifecyclePending}
                  onClick={() => setConfirmAction("cancel")}
                >
                  <Ban className="size-4" aria-hidden="true" />
                  {t.carePlanCancelAction}
                </AppButton>
              ) : null}
              {!canUpdate ? (
                <p className="text-sm text-muted-foreground">{t.carePlanLifecycleNoPermission}</p>
              ) : null}
              {statusValue === "CANCELLED" ? (
                <p className="text-sm text-muted-foreground">{t.carePlanAlreadyCancelled}</p>
              ) : null}
            </div>
          </CrudRecordSection>
        ) : null}
      </CrudRecordWorkspace>

      <ConfirmDialog
        open={confirmAction != null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title={
          confirmAction === "pause"
            ? t.carePlanPauseTitle
            : confirmAction === "resume"
              ? t.carePlanResumeTitle
              : t.carePlanCancelTitle
        }
        description={
          confirmAction === "pause"
            ? t.carePlanPauseDescription
            : confirmAction === "resume"
              ? t.carePlanResumeDescription
              : t.carePlanCancelDescription
        }
        confirmLabel={
          confirmAction === "pause"
            ? t.carePlanPauseAction
            : confirmAction === "resume"
              ? t.carePlanResumeAction
              : t.carePlanCancelAction
        }
        cancelLabel={t.cancel}
        variant={confirmAction === "cancel" ? "destructive" : "default"}
        isLoading={isLifecyclePending}
        onConfirm={() => {
          if (confirmAction === "pause") onPause();
          if (confirmAction === "resume") onResume();
          if (confirmAction === "cancel") onCancelPlan();
          setConfirmAction(null);
        }}
      />

      <ConfirmDialog
        open={skipCycle != null}
        onOpenChange={(open) => {
          if (!open) setSkipCycle(null);
        }}
        title={t.carePlanSkipCycleTitle}
        description={t.carePlanSkipCycleDescription.replace(
          "{cycle}",
          String(skipCycle?.cycleNumber ?? ""),
        )}
        confirmLabel={t.carePlanSkipCycle}
        cancelLabel={t.cancel}
        isLoading={isSkippingCycle}
        onConfirm={() => {
          if (skipCycle) onSkipCycle(skipCycle);
          setSkipCycle(null);
        }}
      />
    </>
  );
}
