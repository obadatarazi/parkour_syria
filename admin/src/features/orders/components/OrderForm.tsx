import { MapPin, Package, ShoppingBag, TicketPercent, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ROUTES } from "@/app/router/routes";
import { OrderCouponPicker } from "@/features/orders/components/OrderCouponPicker";
import { OrderCustomerPicker } from "@/features/orders/components/OrderCustomerPicker";
import { OrderDeliveryZonePicker } from "@/features/orders/components/OrderDeliveryZonePicker";
import { OrderFormPreviewCard } from "@/features/orders/components/OrderFormPreviewCard";
import { OrderLineItemFields } from "@/features/orders/components/OrderLineItemFields";
import type { Order, OrderFormData } from "@/features/orders/types/orders.types";
import {
  createEmptyOrderForm,
  getOrderAmountDue,
  orderToFormData,
} from "@/features/orders/types/orders.types";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import type { AdminUser } from "@/features/users/types/users.types";
import { AppButton, PhoneField, SelectField, TextAreaField, TextField } from "@/shared/components";
import { CrudRecordSection, CrudRecordWorkspace } from "@/shared/crud";
import { CRUD_FORM_FIELD_ANCHORS, ORDER_FORM_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import { useOrderSourceOptions, useOrderStatusOptions } from "@/shared/hooks/use-options";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type OrderFormSectionId = "status" | "items" | "coupons" | "customer" | "delivery";

type OrderFormProps = {
  mode: "create" | "edit";
  order?: Order | null;
  hydrateKey?: number;
  prefillCustomer?: {
    id: number;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
  } | null;
  isLoading?: boolean;
  onSubmit: (data: OrderFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

function parseDeliveryFeeInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

export function OrderForm({
  mode,
  order,
  hydrateKey = 0,
  prefillCustomer = null,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: OrderFormProps) {
  const t = useTranslation();
  const persistInFlightRef = useRef(false);
  const { options: statusOptions } = useOrderStatusOptions();
  const { options: sourceOptions } = useOrderSourceOptions();
  const [form, setForm] = useState<OrderFormData>(createEmptyOrderForm());
  const [activeSection, setActiveSection] = useState<OrderFormSectionId>(
    mode === "create" ? "items" : "status",
  );
  const [zoneError, setZoneError] = useState<string>();
  const [itemsError, setItemsError] = useState<string>();
  const [sourceError, setSourceError] = useState<string>();
  const [deliveryFeeError, setDeliveryFeeError] = useState<string>();
  const [zoneDeliveryFee, setZoneDeliveryFee] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const orderRef = useRef(order);
  orderRef.current = order;

  useEffect(() => {
    const source = orderRef.current;
    setForm(source ? orderToFormData(source) : createEmptyOrderForm());
    setZoneDeliveryFee(source?.deliveryZonePrice?.deliveryFee ?? null);
    setZoneError(undefined);
    setItemsError(undefined);
    setSourceError(undefined);
    setDeliveryFeeError(undefined);
    setIsDirty(false);
  }, [hydrateKey, mode, order?.id]);

  useEffect(() => {
    if (mode !== "create" || !prefillCustomer) return;
    setForm((current) => ({
      ...current,
      userId: prefillCustomer.id,
      fullName: prefillCustomer.fullName,
      email: prefillCustomer.email ?? "",
      phoneNumber: prefillCustomer.phoneNumber ?? "",
    }));
  }, [mode, prefillCustomer]);

  useEffect(() => {
    setActiveSection(mode === "create" ? "items" : "status");
  }, [mode, order?.id]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: OrderFormData) => OrderFormData) => {
    setForm(updater);
    setIsDirty(true);
  };

  const handleSelectCustomer = (user: AdminUser) => {
    updateForm((current) => ({
      ...current,
      userId: user.id,
      fullName: user.fullName || current.fullName,
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
    }));
  };

  const handleClearCustomer = () => {
    updateForm((current) => ({
      ...current,
      userId: null,
    }));
  };

  const handleManualCustomerChange = (
    field: "fullName" | "email" | "phoneNumber",
    value: string,
  ) => {
    updateForm((current) => ({
      ...current,
      // Manual edits unlink the saved customer so guest/new details are submitted.
      userId: null,
      [field]: value,
    }));
  };

  const validate = (): OrderFormSectionId | null => {
    let nextZoneError: string | undefined;
    let nextItemsError: string | undefined;
    let nextSourceError: string | undefined;
    let nextDeliveryFeeError: string | undefined;

    if (!form.deliveryZonePriceId) {
      nextZoneError = t.required;
    }

    const validItems = form.items.filter((item) => item.productId || item.productVariantId);
    if (mode === "create" && validItems.length === 0) {
      nextItemsError = t.required;
    }

    if (mode === "create" && !form.source) {
      nextSourceError = t.required;
    }

    if (form.deliveryFeePrice != null && form.deliveryFeePrice < 0) {
      nextDeliveryFeeError = t.required;
    }

    setZoneError(nextZoneError);
    setItemsError(nextItemsError);
    setSourceError(nextSourceError);
    setDeliveryFeeError(nextDeliveryFeeError);

    if (nextSourceError) return "status";
    if (nextItemsError) return "items";
    if (nextZoneError || nextDeliveryFeeError) return "delivery";
    return null;
  };

  const persist = () => {
    if (isLoading || persistInFlightRef.current) return;
    const errorSection = validate();
    if (errorSection) {
      setActiveSection(errorSection);
      return;
    }
    persistInFlightRef.current = true;
    void Promise.resolve(onSubmit(form)).finally(() => {
      persistInFlightRef.current = false;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    persist();
  };

  const statusLabel =
    statusOptions.find((option) => option.value === form.status)?.label ||
    order?.status?.label ||
    order?.status?.value ||
    (mode === "create" ? t.addOrder : t.notSet);

  const itemCount = form.items.filter((item) => item.productId || item.productVariantId).length;
  const previewAmountDue = order ? getOrderAmountDue(order) : null;

  const deliveryFeeHelperParts = [
    t.orderDeliveryFeeOverrideHint,
    zoneDeliveryFee != null
      ? `${t.orderDeliveryZoneFeeHint}: ${formatKwd(zoneDeliveryFee)}`
      : null,
    mode === "edit" && order?.deliveryFeePrice != null
      ? `${t.orderDeliveryCurrentFeeHint}: ${formatKwd(order.deliveryFeePrice)}`
      : null,
  ].filter(Boolean);

  const sectionItems: {
    id: OrderFormSectionId;
    label: string;
    icon: typeof Package;
    error?: boolean;
    guidance?: string;
  }[] = [
    {
      id: "status",
      label: mode === "edit" ? t.orderStatus : t.orderSource,
      icon: Package,
      error: Boolean(sourceError),
    },
    {
      id: "items",
      label: t.orderItems,
      icon: ShoppingBag,
      error: Boolean(itemsError),
    },
    {
      id: "coupons",
      label: t.orderCoupons,
      icon: TicketPercent,
      guidance: ORDER_FORM_ANCHORS.couponsNav,
    },
    {
      id: "customer",
      label: t.orderCustomer,
      icon: UserRound,
    },
    {
      id: "delivery",
      label: t.orderDelivery,
      icon: MapPin,
      error: Boolean(zoneError || deliveryFeeError),
    },
  ];

  return (
    <CrudRecordWorkspace
      asForm
      onSubmit={handleSubmit}
      onPersist={persist}
      workspaceGuidance={ORDER_FORM_ANCHORS.workspace}
      breadcrumbHref={ROUTES.admin.orders}
      breadcrumbLabel={t.orders}
      title={mode === "create" ? t.addOrder : order?.orderRefNumber || t.editOrder}
      subtitle={t.orderWorkspaceHint}
      meta={
        order?.id ? (
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {t.idLabel}: {order.id}
          </span>
        ) : null
      }
      dirty={isDirty}
      dirtyLabel={t.orderUnsaved}
      onBack={onCancel}
      backLabel={t.backToOrders}
      headerActions={
        <>
          <AppButton type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {t.cancel}
          </AppButton>
          <AppButton
            type="submit"
            isLoading={isLoading}
            loadingText={t.loadingMessage}
            data-guidance={CRUD_FORM_FIELD_ANCHORS.actions}
          >
            {mode === "create" ? t.addOrder : t.save}
          </AppButton>
        </>
      }
      sections={sectionItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      sectionsAriaLabel={t.orderFormSections}
      sectionsGuidance={ORDER_FORM_ANCHORS.sectionNav}
      aside={
        <OrderFormPreviewCard
          orderRefPlaceholder={
            order?.orderRefNumber?.trim() || (mode === "create" ? t.addOrder : t.orderNum)
          }
          statusLabel={statusLabel}
          customerName={form.fullName}
          itemCount={itemCount}
          amountDue={previewAmountDue}
        />
      }
    >
      {activeSection === "status" ? (
        mode === "edit" ? (
          <CrudRecordSection
            title={t.orderStatus}
            description={t.orderStatusSectionHint}
            as="h2"
          >
            <SelectField
              label={t.status}
              value={form.status ?? ""}
              onValueChange={(value) => updateForm((current) => ({ ...current, status: value }))}
              options={statusOptions}
              placeholder={t.selectStatus}
            />
            <SelectField
              label={t.orderSource}
              value={form.source ?? ""}
              onValueChange={(value) => updateForm((current) => ({ ...current, source: value }))}
              options={sourceOptions}
              placeholder={t.selectOrderSource}
            />
          </CrudRecordSection>
        ) : (
          <CrudRecordSection
            title={t.orderSource}
            description={t.orderSourceSectionHint}
            as="h2"
          >
            <SelectField
              label={t.orderSource}
              value={form.source ?? ""}
              onValueChange={(value) => {
                updateForm((current) => ({ ...current, source: value }));
                setSourceError(undefined);
              }}
              options={sourceOptions}
              placeholder={t.selectOrderSource}
              required
              error={sourceError}
            />
          </CrudRecordSection>
        )
      ) : null}

      {activeSection === "items" ? (
        <CrudRecordSection title={t.orderItems} description={t.orderItemsSectionHint} as="h2">
          {mode === "edit" ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">{t.orderItemsReplaceHint}</p>
          ) : null}
          <OrderLineItemFields
            items={form.items}
            onChange={(items) => updateForm((current) => ({ ...current, items }))}
            error={itemsError}
          />
        </CrudRecordSection>
      ) : null}

      {activeSection === "coupons" ? (
        <CrudRecordSection
          title={t.orderCoupons}
          description={t.orderCouponSectionHint}
          as="h2"
          dataGuidance={ORDER_FORM_ANCHORS.coupons}
        >
          <OrderCouponPicker
            value={form.couponCodes}
            onChange={(couponCodes) => updateForm((current) => ({ ...current, couponCodes }))}
            disabled={isLoading}
            readOnly={mode === "edit"}
          />
        </CrudRecordSection>
      ) : null}

      {activeSection === "customer" ? (
        <CrudRecordSection
          title={t.orderCustomer}
          description={t.orderCustomerSectionHint}
          as="h2"
        >
          <OrderCustomerPicker
            value={form.userId}
            onSelect={handleSelectCustomer}
            onClear={handleClearCustomer}
            disabled={isLoading}
          />

          <div className="space-y-3 border-t border-border/60 pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              {t.orderCustomerDetailsHeading}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label={t.fullName}
                value={form.fullName}
                onChange={(event) => handleManualCustomerChange("fullName", event.target.value)}
                placeholder={t.orderCustomerManualPlaceholder}
              />
              <TextField
                label={t.email}
                type="email"
                value={form.email}
                onChange={(event) => handleManualCustomerChange("email", event.target.value)}
              />
              <PhoneField
                label={t.phone}
                value={form.phoneNumber}
                onChange={(event) =>
                  handleManualCustomerChange("phoneNumber", event.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-3 border-t border-border/60 pt-4">
            <TextAreaField
              label={t.orderNote}
              value={form.note}
              onChange={(event) =>
                updateForm((current) => ({ ...current, note: event.target.value }))
              }
              placeholder={t.orderNotePlaceholder}
              helperText={t.orderNoteHint}
              maxLength={1000}
              rows={3}
              disabled={isLoading}
            />
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "delivery" ? (
        <CrudRecordSection
          title={t.orderDelivery}
          description={t.orderDeliverySectionHint}
          as="h2"
        >
          <OrderDeliveryZonePicker
            value={form.deliveryZonePriceId}
            onSelect={(zone) => {
              setZoneDeliveryFee(zone.deliveryFee);
              setZoneError(undefined);
              // Clear any typed override so the new zone fee applies unless the admin re-enters one.
              updateForm((current) => ({
                ...current,
                deliveryZonePriceId: zone.id,
                deliveryFeePrice: null,
              }));
            }}
            onClear={() => {
              setZoneDeliveryFee(null);
              updateForm((current) => ({
                ...current,
                deliveryZonePriceId: null,
                deliveryFeePrice: null,
              }));
            }}
            disabled={isLoading}
            error={zoneError}
            required
          />

          <TextField
            label={t.orderDeliveryFeeOverride}
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={form.deliveryFeePrice == null ? "" : String(form.deliveryFeePrice)}
            onChange={(event) => {
              const raw = event.target.value.trim();
              const next = parseDeliveryFeeInput(event.target.value);
              // Preserve a typed "0" as free shipping; empty clears the override.
              updateForm((current) => ({
                ...current,
                deliveryFeePrice: raw === "" ? null : next ?? current.deliveryFeePrice,
              }));
              setDeliveryFeeError(undefined);
            }}
            placeholder={
              zoneDeliveryFee != null
                ? String(zoneDeliveryFee)
                : t.orderDeliveryFeeOverridePlaceholder
            }
            helperText={deliveryFeeHelperParts.join(" ")}
            error={deliveryFeeError}
            disabled={isLoading}
          />

          <div className="space-y-3 border-t border-border/60 pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              {t.orderShippingAddressHeading}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label={t.addressTitle}
                value={form.addressTitle}
                onChange={(event) =>
                  updateForm((current) => ({ ...current, addressTitle: event.target.value }))
                }
              />
              <PhoneField
                label={t.addressPhone}
                value={form.addressPhoneNumber}
                onChange={(event) =>
                  updateForm((current) => ({
                    ...current,
                    addressPhoneNumber: event.target.value,
                  }))
                }
              />
              <TextField
                label={t.street}
                value={form.addressStreetTitle}
                onChange={(event) =>
                  updateForm((current) => ({
                    ...current,
                    addressStreetTitle: event.target.value,
                  }))
                }
              />
              <TextField
                label={t.block}
                value={form.addressBlock}
                onChange={(event) =>
                  updateForm((current) => ({ ...current, addressBlock: event.target.value }))
                }
              />
              <TextField
                label={t.building}
                value={form.addressBuilding}
                onChange={(event) =>
                  updateForm((current) => ({ ...current, addressBuilding: event.target.value }))
                }
              />
              <TextField
                label={t.floor}
                value={form.addressFloorNumber}
                onChange={(event) =>
                  updateForm((current) => ({
                    ...current,
                    addressFloorNumber: event.target.value,
                  }))
                }
              />
              <TextField
                label={t.apartment}
                value={form.addressApartment}
                onChange={(event) =>
                  updateForm((current) => ({ ...current, addressApartment: event.target.value }))
                }
              />
              <TextField
                label={t.landmark}
                value={form.addressLandmark}
                onChange={(event) =>
                  updateForm((current) => ({ ...current, addressLandmark: event.target.value }))
                }
              />
            </div>
          </div>
        </CrudRecordSection>
      ) : null}
    </CrudRecordWorkspace>
  );
}
