import {
  Bell,
  CreditCard,
  ExternalLink,
  HeartPulse,
  MapPin,
  Pause,
  Pencil,
  Percent,
  Play,
  Plus,
  Receipt,
  ShoppingBag,
  Star,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import { orderNewPath, orderViewPath, ROUTES } from "@/app/router/routes";
import { CustomerAssignCouponDialog } from "@/features/customers/components/CustomerAssignCouponDialog";
import { CustomerCrmProfileDialog } from "@/features/customers/components/CustomerCrmProfileDialog";
import { CustomerSendNotificationDialog } from "@/features/customers/components/CustomerSendNotificationDialog";
import { CustomerTagBadges } from "@/features/customers/components/CustomerTagBadges";
import { useCustomerMutations } from "@/features/customers/hooks/use-customer-mutations";
import {
  useCustomerOrdersSlice,
  useCustomerPaymentsSlice,
} from "@/features/customers/hooks/use-customer-slices";
import { useStaffNoteMutations } from "@/features/customers/hooks/use-staff-note-mutations";
import { useStaffNoteTypeOptions } from "@/features/customers/hooks/use-staff-note-type-options";
import type {
  CrmCustomer,
  CrmInvoiceStatusFilter,
  CrmStaffNote,
  CrmStaffNoteType,
  CrmTimelineType,
} from "@/features/customers/types/customers.types";
import { visibleTags } from "@/features/customers/utils/crm-segments";
import {
  customerCarePlansListHref,
  customerOrdersListHref,
  customerPrescriptionsListHref,
  customerProductReviewsListHref,
} from "@/features/customers/utils/customer-links";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import {
  AppButton,
  AppCard,
  PhoneNumberText,
  StatusBadge,
  type StatusBadgeVariant,
  UserAvatar,
} from "@/shared/components";
import { CrudDetailField, CrudDetailSection } from "@/shared/crud";
import { Textarea } from "@/shared/design-system/components/ui/textarea";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type CustomerCrmWorkspaceProps = {
  customer: CrmCustomer;
  onCustomerChange: (customer: CrmCustomer) => void;
  onRefresh: () => Promise<void>;
};

const ORDER_STATUS: Record<string, StatusBadgeVariant> = {
  DELIVERED: "success",
  SHIPPED: "info",
  PROCESSING: "warning",
  PENDING: "neutral",
  CANCELLED: "danger",
};

const PLAN_STATUS: Record<string, StatusBadgeVariant> = {
  ACTIVE: "success",
  PAUSED: "warning",
  CANCELLED: "danger",
};

const INVOICE_STATUS: Record<string, StatusBadgeVariant> = {
  PAID: "success",
  UNPAID: "warning",
  FAILED: "danger",
  REFUNDED: "info",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
};

type TimelineEventFilter = CrmTimelineType | "";

function viewAllAction(href: string, label: string) {
  return (
    <AppButton variant="outline" size="sm" asChild>
      <Link to={href}>
        {label}
        <ExternalLink className="size-3.5" aria-hidden="true" />
      </Link>
    </AppButton>
  );
}

export function CustomerCrmWorkspace({
  customer,
  onCustomerChange,
  onRefresh,
}: CustomerCrmWorkspaceProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const navigate = useNavigate();
  const mutations = useCustomerMutations({ onSuccess: onCustomerChange });
  const staffNotes = useStaffNoteMutations({
    customerId: customer.id,
    onSuccess: onRefresh,
  });
  const { options: noteTypeOptions } = useStaffNoteTypeOptions();
  const [noteBody, setNoteBody] = useState("");
  const [noteType, setNoteType] = useState<CrmStaffNoteType>("GENERAL");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editType, setEditType] = useState<CrmStaffNoteType>("GENERAL");
  const [profileOpen, setProfileOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [timelineEventFilter, setTimelineEventFilter] = useState<TimelineEventFilter>("");

  const ordersSlice = useCustomerOrdersSlice({ customer });
  const paymentsSlice = useCustomerPaymentsSlice({ customer });

  const tags = visibleTags(customer);
  const canTogglePlan = Boolean(
    customer.carePlan && customer.carePlan.status.value !== "CANCELLED",
  );
  const planPaused = customer.carePlan?.status.value === "PAUSED";

  const coupons = customer.coupons ?? [];
  const prescriptions = customer.prescriptions ?? [];
  const reviews = customer.reviews ?? [];
  const addresses = customer.addresses ?? [];
  const staffNotesList = customer.staffNotes ?? [];
  const timeline = customer.timeline ?? [];

  const timelineFilters = useMemo(
    (): { value: TimelineEventFilter; label: string }[] => [
      { value: "", label: t.crmTimelineFilterAll },
      { value: "order", label: t.crmEventOrder },
      { value: "payment", label: t.crmEventPayment },
      { value: "care_plan", label: t.crmEventCarePlan },
      { value: "loyalty", label: t.crmEventLoyalty },
      { value: "note", label: t.crmEventNote },
      { value: "notification", label: t.crmEventNotification },
      { value: "coupon", label: t.crmEventCoupon },
      { value: "review", label: t.crmEventReview },
      { value: "prescription", label: t.crmEventPrescription },
      { value: "registered", label: t.crmEventRegistered },
    ],
    [t],
  );

  const filteredTimeline = useMemo(() => {
    if (!timelineEventFilter) return timeline;
    return timeline.filter((item) => item.type === timelineEventFilter);
  }, [timeline, timelineEventFilter]);

  const paymentFilters = useMemo(
    (): { value: CrmInvoiceStatusFilter | ""; label: string }[] => [
      { value: "", label: t.crmPaymentFilterAll },
      { value: "paid", label: t.crmPaymentFilterPaid },
      { value: "unpaid", label: t.crmPaymentFilterUnpaid },
    ],
    [t],
  );

  const noteTypeLabel = useMemo(() => {
    const map: Record<string, string> = {};
    for (const option of noteTypeOptions) {
      map[option.value] = option.label;
    }
    return map;
  }, [noteTypeOptions]);

  const notesBusy =
    staffNotes.createNote.isPending ||
    staffNotes.updateNote.isPending ||
    staffNotes.deleteNote.isPending;

  const startEditNote = (item: CrmStaffNote) => {
    setEditingNoteId(item.id);
    setEditBody(item.body);
    setEditType(item.type.value);
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditBody("");
    setEditType("GENERAL");
  };

  const saveEditNote = async () => {
    if (editingNoteId == null || !editBody.trim()) return;
    const result = await staffNotes.updateNote.mutate({
      noteId: editingNoteId,
      input: { body: editBody.trim(), type: editType },
    });
    if (result.ok) cancelEditNote();
  };

  const toggleCarePlan = async () => {
    if (planPaused) {
      await mutations.resumeCarePlan.mutate(customer);
    } else {
      await mutations.pauseCarePlan.mutate(customer);
    }
  };

  return (
    <div className="space-y-6">
      <AppCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <UserAvatar name={customer.fullName} size="lg" className="size-16 text-xl" />
            <div className="min-w-0 space-y-2">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{customer.fullName}</h2>
                <p className="text-sm text-muted-foreground">
                  {[customer.email, customer.phoneNumber].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  label={customer.active ? t.active : t.inactive}
                  variant={customer.active ? "success" : "neutral"}
                />
                <StatusBadge
                  label={
                    customer.whatsappNotificationsEnabled
                      ? t.whatsappEnabled
                      : t.whatsappDisabled
                  }
                  variant={customer.whatsappNotificationsEnabled ? "success" : "neutral"}
                />
                <StatusBadge
                  label={
                    customer.cookiesAccepted
                      ? t.crmCookiesAccepted
                      : t.crmCookiesNotAccepted
                  }
                  variant={customer.cookiesAccepted ? "success" : "neutral"}
                />
                <CustomerTagBadges tags={tags} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AppButton variant="outline" size="sm" onClick={() => setProfileOpen(true)}>
              <Pencil className="size-4" aria-hidden="true" />
              {t.crmEditProfile}
            </AppButton>
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => void mutations.toggleVip.mutate(customer)}
            >
              <Star className="size-4" aria-hidden="true" />
              {customer.isVip ? t.crmRemoveVip : t.crmMarkVip}
            </AppButton>
            <AppButton variant="outline" size="sm" onClick={() => setCouponOpen(true)}>
              <Receipt className="size-4" aria-hidden="true" />
              {t.crmAssignCoupon}
            </AppButton>
            <AppButton variant="outline" size="sm" onClick={() => setNotificationOpen(true)}>
              <Bell className="size-4" aria-hidden="true" />
              {t.crmSendNotification}
            </AppButton>
            {canTogglePlan ? (
              <AppButton variant="outline" size="sm" onClick={() => void toggleCarePlan()}>
                {planPaused ? (
                  <Play className="size-4" aria-hidden="true" />
                ) : (
                  <Pause className="size-4" aria-hidden="true" />
                )}
                {planPaused ? t.crmResumePlan : t.crmPausePlan}
              </AppButton>
            ) : null}
            <AppButton
              size="sm"
              onClick={() => navigate(orderNewPath(customer.id))}
            >
              <Plus className="size-4" aria-hidden="true" />
              {t.crmCreateOrder}
            </AppButton>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <CrudDetailField label={t.spent}>{formatKwd(customer.spent)}</CrudDetailField>
          <CrudDetailField label={t.orders}>{customer.ordersCount}</CrudDetailField>
          <CrudDetailField label={t.points}>
            {customer.loyalty.pointsBalance.toLocaleString("en-US")}
          </CrudDetailField>
          <CrudDetailField label={t.whatsappPhoneNumber}>
            {customer.whatsappPhoneNumber ? (
              <PhoneNumberText value={customer.whatsappPhoneNumber} />
            ) : (
              <span className="text-muted-foreground">{t.whatsappUsesAccountPhone}</span>
            )}
          </CrudDetailField>
          <CrudDetailField label={t.joined}>
            {customer.joinedAt ? formatDateTime(customer.joinedAt, language) : "—"}
          </CrudDetailField>
          <CrudDetailField label={t.lastOrder}>
            {customer.lastOrderAt ? formatDateTime(customer.lastOrderAt, language) : "—"}
          </CrudDetailField>
          <CrudDetailField label={t.crmCookiesAcceptedAt}>
            {customer.cookiesAcceptedAt
              ? formatDateTime(customer.cookiesAcceptedAt, language)
              : "—"}
          </CrudDetailField>
        </dl>
      </AppCard>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <CrudDetailSection
            title={t.orders}
            description={t.crmOrdersHint}
            actions={viewAllAction(customerOrdersListHref(customer.id), t.viewAll)}
          >
            {ordersSlice.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.crmNoOrders}</p>
            ) : (
              <ul className="divide-y divide-border">
                {ordersSlice.items.map((order) => (
                  <li
                    key={order.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Link
                        to={orderViewPath(order.orderRefNumber ?? String(order.id))}
                        className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-brand"
                      >
                        <ShoppingBag className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        {order.orderRefNumber}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(order.placedAt, language)} · {order.items} {t.items}
                        {order.paymentMethod ? ` · ${order.paymentMethod}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label={order.status.label}
                        variant={ORDER_STATUS[order.status.value] ?? "neutral"}
                      />
                      <span className="text-sm font-bold text-brand">{formatKwd(order.total)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {ordersSlice.hasMore ? (
              <div className="mt-4">
                {ordersSlice.error ? (
                  <p className="mb-2 text-sm text-destructive">
                    {resolveServiceErrorMessage(ordersSlice.error, t)}
                  </p>
                ) : null}
                <AppButton
                  type="button"
                  variant="outline"
                  size="sm"
                  isLoading={ordersSlice.isLoading}
                  loadingText={t.loadingMessage}
                  onClick={() => void ordersSlice.loadMore()}
                >
                  {t.crmLoadMore}
                </AppButton>
              </div>
            ) : null}
          </CrudDetailSection>

          <CrudDetailSection title={t.crmPayments} description={t.crmPaymentsHint}>
            <div className="mb-4 flex flex-wrap gap-2">
              {paymentFilters.map(({ value, label }) => (
                <AppButton
                  key={value || "all"}
                  type="button"
                  size="sm"
                  variant={paymentsSlice.invoiceStatus === value ? "default" : "outline"}
                  onClick={() => paymentsSlice.setPaymentFilter(value)}
                >
                  {label}
                </AppButton>
              ))}
            </div>
            {paymentsSlice.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.crmNoPayments}</p>
            ) : (
              <ul className="divide-y divide-border">
                {paymentsSlice.items.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <CreditCard className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        #{payment.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.orderId ? `#${payment.orderId}` : null}
                        {payment.method ? ` · ${payment.method}` : ""}
                        {payment.paidAt ? ` · ${formatDateTime(payment.paidAt, language)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label={payment.status.label}
                        variant={INVOICE_STATUS[payment.status.value] ?? "neutral"}
                      />
                      <span className="text-sm font-bold text-brand">
                        {formatKwd(payment.amount)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {paymentsSlice.hasMore ? (
              <div className="mt-4">
                {paymentsSlice.error ? (
                  <p className="mb-2 text-sm text-destructive">
                    {resolveServiceErrorMessage(paymentsSlice.error, t)}
                  </p>
                ) : null}
                <AppButton
                  type="button"
                  variant="outline"
                  size="sm"
                  isLoading={paymentsSlice.isLoading}
                  loadingText={t.loadingMessage}
                  onClick={() => void paymentsSlice.loadMore()}
                >
                  {t.crmLoadMore}
                </AppButton>
              </div>
            ) : null}
          </CrudDetailSection>

          <CrudDetailSection
            title={t.crmCarePlan}
            actions={
              customer.carePlan
                ? viewAllAction(customerCarePlansListHref(customer.id), t.viewAll)
                : undefined
            }
          >
            {customer.carePlan ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <HeartPulse className="size-4 text-brand" aria-hidden="true" />
                  <Link
                    to={`${ROUTES.admin.carePlans}/${customer.carePlan.id}`}
                    className="font-semibold text-foreground hover:text-brand"
                  >
                    #{customer.carePlan.id}
                  </Link>
                  <StatusBadge
                    label={customer.carePlan.status.label}
                    variant={PLAN_STATUS[customer.carePlan.status.value] ?? "neutral"}
                  />
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <CrudDetailField label={t.crmFrequency}>
                    {customer.carePlan.frequency}
                  </CrudDetailField>
                  <CrudDetailField label={t.crmNextDelivery}>
                    {customer.carePlan.nextDeliveryAt
                      ? formatDateTime(customer.carePlan.nextDeliveryAt, language)
                      : "—"}
                  </CrudDetailField>
                </dl>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.crmNoCarePlan}</p>
            )}
          </CrudDetailSection>

          <CrudDetailSection title={t.crmLoyalty}>
            <dl className="grid gap-3 sm:grid-cols-3">
              <CrudDetailField label={t.points}>
                {customer.loyalty.pointsBalance.toLocaleString("en-US")}
              </CrudDetailField>
              <CrudDetailField label={t.crmLifetimeEarned}>
                {customer.loyalty.lifetimeEarned.toLocaleString("en-US")}
              </CrudDetailField>
              <CrudDetailField label={t.crmLifetimeRedeemed}>
                {customer.loyalty.lifetimeRedeemed.toLocaleString("en-US")}
              </CrudDetailField>
            </dl>
          </CrudDetailSection>

          <CrudDetailSection title={t.crmCoupons} description={t.crmCouponsHint}>
            {coupons.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.crmNoCoupons}</p>
            ) : (
              <ul className="divide-y divide-border">
                {coupons.map((coupon, index) => (
                  <li
                    key={`${coupon.code ?? "coupon"}-${index}`}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
                        <Percent className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        {coupon.code ?? "—"}
                        {coupon.valueLabel ? (
                          <span className="font-sans text-xs text-brand">{coupon.valueLabel}</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {coupon.title ?? ""}
                        {coupon.orderId ? ` · #${coupon.orderId}` : ""}
                        {coupon.usedAt
                          ? ` · ${formatDateTime(coupon.usedAt, language)}`
                          : coupon.assignedAt
                            ? ` · ${formatDateTime(coupon.assignedAt, language)}`
                            : ""}
                      </p>
                    </div>
                    <StatusBadge label={coupon.status.label} variant="info" />
                  </li>
                ))}
              </ul>
            )}
          </CrudDetailSection>

          <CrudDetailSection
            title={t.prescriptions}
            actions={viewAllAction(customerPrescriptionsListHref(customer.id), t.viewAll)}
          >
            {prescriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.crmNoPrescriptions}</p>
            ) : (
              <ul className="space-y-3">
                {prescriptions.map((rx) => (
                  <li key={rx.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{rx.prescriptionNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {rx.productsCount} {t.items}
                        {rx.createdAt ? ` · ${formatDateTime(rx.createdAt, language)}` : ""}
                      </p>
                    </div>
                    <StatusBadge label={rx.status.label} variant="warning" />
                  </li>
                ))}
              </ul>
            )}
          </CrudDetailSection>

          <CrudDetailSection
            title={t.crmProductReviews}
            description={t.crmProductReviewsHint}
            actions={viewAllAction(customerProductReviewsListHref(customer.id), t.viewAll)}
          >
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.crmNoReviews}</p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-lg border border-border bg-muted/30 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {review.productTitle ?? "—"}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-warning">
                          <Star className="size-3.5 fill-current" aria-hidden="true" />
                          {review.rating}/5
                        </p>
                      </div>
                      <StatusBadge label={review.status.label} variant="neutral" />
                    </div>
                    {review.body ? (
                      <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      #{review.id}
                      {review.createdAt ? ` · ${formatDateTime(review.createdAt, language)}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CrudDetailSection>

          <CrudDetailSection title={t.crmAddresses}>
            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.crmNoAddresses}</p>
            ) : (
              <ul className="space-y-3">
                {addresses.map((address) => (
                  <li key={address.id} className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {address.title ?? t.crmAddresses}
                        {address.isDefault ? (
                          <span className="ms-2 text-xs font-medium text-brand">
                            {t.crmDefaultAddress}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {address.line}
                        {address.phone ? ` · ${address.phone}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CrudDetailSection>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <CrudDetailSection title={t.crmInternalNotes} description={t.crmNotesHint}>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!noteBody.trim()) return;
                void staffNotes.createNote
                  .mutate({ body: noteBody.trim(), type: noteType })
                  .then((result) => {
                    if (result.ok) setNoteBody("");
                  });
              }}
            >
              <div className="flex flex-wrap gap-2">
                {noteTypeOptions.map((option) => (
                  <AppButton
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={noteType === option.value ? "default" : "outline"}
                    onClick={() => setNoteType(option.value as CrmStaffNoteType)}
                  >
                    {option.label}
                  </AppButton>
                ))}
              </div>
              <Textarea
                value={noteBody}
                onChange={(event) => setNoteBody(event.target.value)}
                placeholder={t.crmNotePlaceholder}
                rows={3}
              />
              <AppButton
                type="submit"
                size="sm"
                disabled={!noteBody.trim() || staffNotes.createNote.isPending}
              >
                <StickyNote className="size-4" aria-hidden="true" />
                {t.crmAddNote}
              </AppButton>
            </form>
            <ul className="mt-4 space-y-3">
              {staffNotesList.length === 0 ? (
                <li className="text-sm text-muted-foreground">{t.crmNoNotes}</li>
              ) : (
                staffNotesList.map((item) => {
                  const isEditing = editingNoteId === item.id;
                  return (
                    <li
                      key={item.id}
                      className="rounded-lg border border-border bg-muted/40 px-3 py-2"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {noteTypeOptions.map((option) => (
                              <AppButton
                                key={option.value}
                                type="button"
                                size="sm"
                                variant={editType === option.value ? "default" : "outline"}
                                disabled={notesBusy}
                                onClick={() =>
                                  setEditType(option.value as CrmStaffNoteType)
                                }
                              >
                                {option.label}
                              </AppButton>
                            ))}
                          </div>
                          <Textarea
                            value={editBody}
                            onChange={(event) => setEditBody(event.target.value)}
                            placeholder={t.crmNotePlaceholder}
                            rows={3}
                            disabled={notesBusy}
                          />
                          <div className="flex flex-wrap gap-2">
                            <AppButton
                              type="button"
                              size="sm"
                              disabled={!editBody.trim() || notesBusy}
                              onClick={() => void saveEditNote()}
                            >
                              {t.save}
                            </AppButton>
                            <AppButton
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={notesBusy}
                              onClick={cancelEditNote}
                            >
                              {t.cancel}
                            </AppButton>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-foreground">{item.body}</p>
                          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground">
                              {item.author?.fullName ?? "—"} ·{" "}
                              {noteTypeLabel[item.type.value] ?? item.type.label} ·{" "}
                              {item.createdAt
                                ? formatDateTime(item.createdAt, language)
                                : "—"}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              <AppButton
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                disabled={notesBusy}
                                onClick={() => startEditNote(item)}
                              >
                                <Pencil className="size-3.5" aria-hidden="true" />
                                {t.edit}
                              </AppButton>
                              <AppButton
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-destructive hover:text-destructive"
                                disabled={notesBusy}
                                onClick={() =>
                                  void staffNotes.deleteNote.mutate(item.id)
                                }
                              >
                                <Trash2 className="size-3.5" aria-hidden="true" />
                                {t.delete}
                              </AppButton>
                            </div>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </CrudDetailSection>

          <CrudDetailSection title={t.crmTimeline} description={t.crmTimelineHint}>
            <div className="mb-4 flex flex-wrap gap-2">
              {timelineFilters.map(({ value, label }) => (
                <AppButton
                  key={value || "all"}
                  type="button"
                  size="sm"
                  variant={timelineEventFilter === value ? "default" : "outline"}
                  onClick={() => setTimelineEventFilter(value)}
                >
                  {label}
                </AppButton>
              ))}
            </div>
            <ol className="space-y-3">
              {filteredTimeline.length === 0 ? (
                <li className="text-sm text-muted-foreground">{t.crmTimelineEmptyFilter}</li>
              ) : (
                filteredTimeline.map((item) => (
                  <li key={`${item.type}-${item.id}`} className="flex gap-3">
                    <span
                      className="mt-1 size-2 shrink-0 rounded-full bg-brand"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {timelineLabel(item.type, t)} ·{" "}
                        {item.at ? formatDateTime(item.at, language) : "—"}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ol>
          </CrudDetailSection>
        </div>
      </div>

      <CustomerCrmProfileDialog
        open={profileOpen}
        customer={customer}
        isSaving={mutations.updateProfile.isPending}
        onOpenChange={setProfileOpen}
        onSave={async (input) => {
          const result = await mutations.updateProfile.mutate({ id: customer.id, input });
          return result.ok;
        }}
      />

      <CustomerAssignCouponDialog
        open={couponOpen}
        isSaving={mutations.assignCoupon.isPending}
        onOpenChange={setCouponOpen}
        onAssign={async (couponId) => {
          const result = await mutations.assignCoupon.mutate({
            id: customer.id,
            input: { couponId },
          });
          return result.ok;
        }}
      />

      <CustomerSendNotificationDialog
        open={notificationOpen}
        isSaving={mutations.sendNotification.isPending}
        onOpenChange={setNotificationOpen}
        onSend={async (input) => {
          const result = await mutations.sendNotification.mutate({ id: customer.id, input });
          return result.ok;
        }}
      />
    </div>
  );
}

function timelineLabel(
  type: CrmTimelineType,
  t: {
    crmEventRegistered: string;
    crmEventOrder: string;
    crmEventPayment: string;
    crmEventCarePlan: string;
    crmEventLoyalty: string;
    crmEventPrescription: string;
    crmEventNote: string;
    crmEventNotification: string;
    crmEventCoupon: string;
    crmEventReview: string;
    crmEventProfile: string;
  },
): string {
  switch (type) {
    case "registered":
      return t.crmEventRegistered;
    case "order":
      return t.crmEventOrder;
    case "payment":
      return t.crmEventPayment;
    case "care_plan":
      return t.crmEventCarePlan;
    case "loyalty":
      return t.crmEventLoyalty;
    case "prescription":
      return t.crmEventPrescription;
    case "note":
      return t.crmEventNote;
    case "notification":
      return t.crmEventNotification;
    case "coupon":
      return t.crmEventCoupon;
    case "review":
      return t.crmEventReview;
    case "profile":
      return t.crmEventProfile;
  }
}
