import { HeartPulse, Package, Settings2, Truck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ROUTES } from "@/app/router/routes";
import { CarePlanItemsEditor } from "@/features/care-plans/components/CarePlanItemsEditor";
import { CarePlanUserAddressPicker } from "@/features/care-plans/components/CarePlanUserAddressPicker";
import { useCarePlanPaymentProviderOptions } from "@/features/care-plans/hooks/use-care-plan-payment-provider-options";
import type { CarePlan, CarePlanFormData } from "@/features/care-plans/types/care-plans.types";
import {
  carePlanToFormData,
  createEmptyCarePlanForm,
  getCarePlanCustomerLabel,
} from "@/features/care-plans/types/care-plans.types";
import { OrderCustomerPicker } from "@/features/orders/components/OrderCustomerPicker";
import { OrderDeliveryZonePicker } from "@/features/orders/components/OrderDeliveryZonePicker";
import { AppButton, looksLikePhoneNumber,SelectField, TextField } from "@/shared/components";
import { CrudRecordSection, CrudRecordWorkspace } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  CARE_PLAN_GUIDANCE_ANCHORS,
  CRUD_FORM_FIELD_ANCHORS,
} from "@/shared/guidance/constants/guidance.constants";
import {
  useCarePlanFrequencyOptions,
  useCarePlanPreferredWeekdayOptions,
} from "@/shared/hooks/use-options";

type CarePlanFormSectionId = "basics" | "delivery" | "items";

type CarePlanFormProps = {
  mode: "create" | "edit";
  entity?: CarePlan | null;
  hydrateKey?: number;
  isLoading?: boolean;
  onSubmit: (data: CarePlanFormData, originalForm?: CarePlanFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const WEEKDAY_VALUES = [0, 1, 2, 3, 4, 5, 6] as const;
const UNSET_WEEKDAY_VALUE = "__none";

export function CarePlanForm({
  mode,
  entity,
  hydrateKey = 0,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: CarePlanFormProps) {
  const t = useTranslation();
  const { options: frequencyOptions } = useCarePlanFrequencyOptions();
  const { options: weekdayEnumOptions } = useCarePlanPreferredWeekdayOptions();
  const { options: paymentProviderOptions } = useCarePlanPaymentProviderOptions();
  const [form, setForm] = useState<CarePlanFormData>(() =>
    mode === "edit" && entity ? carePlanToFormData(entity) : createEmptyCarePlanForm(),
  );
  const [initialForm, setInitialForm] = useState<CarePlanFormData | null>(
    mode === "edit" && entity ? carePlanToFormData(entity) : null,
  );
  const [activeSection, setActiveSection] = useState<CarePlanFormSectionId>("basics");
  const [userError, setUserError] = useState<string>();
  const [addressError, setAddressError] = useState<string>();
  const [paymentError, setPaymentError] = useState<string>();
  const [frequencyError, setFrequencyError] = useState<string>();
  const [itemsError, setItemsError] = useState<string>();
  const [isDirty, setIsDirty] = useState(false);
  const persistInFlightRef = useRef(false);

  useEffect(() => {
    if (mode !== "edit" || !entity) return;
    const next = carePlanToFormData(entity);
    setForm(next);
    setInitialForm(next);
    setIsDirty(false);
    onDirtyChange?.(false);
  }, [entity, hydrateKey, mode, onDirtyChange]);

  const updateForm = (updater: (current: CarePlanFormData) => CarePlanFormData) => {
    setForm((current) => {
      const next = updater(current);
      setIsDirty(true);
      onDirtyChange?.(true);
      return next;
    });
  };

  const weekdayOptions = useMemo(
    () => [
      { value: UNSET_WEEKDAY_VALUE, label: t.notSet },
      ...weekdayEnumOptions.filter((option) =>
        WEEKDAY_VALUES.includes(Number(option.value) as (typeof WEEKDAY_VALUES)[number]),
      ),
    ],
    [t.notSet, weekdayEnumOptions],
  );

  const validate = (): CarePlanFormSectionId | null => {
    let nextUserError: string | undefined;
    let nextAddressError: string | undefined;
    let nextPaymentError: string | undefined;
    let nextFrequencyError: string | undefined;
    let nextItemsError: string | undefined;

    if (mode === "create" && form.userId == null) {
      nextUserError = t.carePlanUserRequired;
    }
    if (form.userAddressId == null) {
      nextAddressError = t.carePlanAddressRequired;
    }
    if (form.paymentProviderId == null) {
      nextPaymentError = t.carePlanPaymentRequired;
    }
    if (!form.frequency) {
      nextFrequencyError = t.carePlanFrequencyRequired;
    }
    const validItems = form.items.filter((item) => item.productId != null && item.quantity >= 1);
    if (validItems.length === 0) {
      nextItemsError = t.carePlanItemsRequired;
    }

    setUserError(nextUserError);
    setAddressError(nextAddressError);
    setPaymentError(nextPaymentError);
    setFrequencyError(nextFrequencyError);
    setItemsError(nextItemsError);

    if (nextUserError || nextAddressError || nextPaymentError || nextFrequencyError) {
      return "basics";
    }
    if (nextItemsError) return "items";
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
    void Promise.resolve(onSubmit(form, initialForm ?? undefined)).finally(() => {
      persistInFlightRef.current = false;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    persist();
  };

  const title =
    mode === "create"
      ? t.addCarePlan
      : entity
        ? getCarePlanCustomerLabel(entity, t.editCarePlan)
        : t.editCarePlan;

  const sectionItems: {
    id: CarePlanFormSectionId;
    label: string;
    icon: typeof HeartPulse;
    error?: boolean;
  }[] = [
    {
      id: "basics",
      label: t.carePlanBasicsSection,
      icon: Settings2,
      error: Boolean(userError || addressError || paymentError || frequencyError),
    },
    {
      id: "delivery",
      label: t.carePlanDeliverySection,
      icon: Truck,
    },
    {
      id: "items",
      label: t.carePlanItemsSection,
      icon: Package,
      error: Boolean(itemsError),
    },
  ];

  return (
    <CrudRecordWorkspace
      asForm
      onSubmit={handleSubmit}
      onPersist={persist}
      workspaceGuidance={CARE_PLAN_GUIDANCE_ANCHORS.workspace}
      breadcrumbHref={ROUTES.admin.carePlans}
      breadcrumbLabel={t.carePlans}
      title={title}
      subtitle={t.carePlanWorkspaceHint}
      meta={
        entity ? (
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {t.idLabel}: {entity.id}
          </span>
        ) : null
      }
      dirty={isDirty}
      dirtyLabel={t.carePlanUnsaved}
      onBack={onCancel}
      backLabel={t.backToCarePlans}
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
            {mode === "create" ? t.addCarePlan : t.save}
          </AppButton>
        </>
      }
      sections={sectionItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      sectionsAriaLabel={t.carePlanFormSections}
      sectionsGuidance={CARE_PLAN_GUIDANCE_ANCHORS.sectionNav}
      aside={
        <aside className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground">
              <HeartPulse className="size-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {mode === "create" ? t.addCarePlan : t.editCarePlan}
              </p>
              <p className="text-xs text-muted-foreground">{t.carePlanFormPreviewHint}</p>
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t.carePlanFrequency}</dt>
              <dd className="font-medium text-foreground">
                {frequencyOptions.find((option) => option.value === form.frequency)?.label ||
                  form.frequency ||
                  t.notSet}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t.carePlanItemsCount}</dt>
              <dd className="font-medium text-foreground">
                {form.items.filter((item) => item.productId != null).length}
              </dd>
            </div>
          </dl>
        </aside>
      }
    >
      {activeSection === "basics" ? (
        <CrudRecordSection
          title={t.carePlanBasicsSection}
          description={t.carePlanBasicsSectionHint}
          as="h2"
          dataGuidance={CARE_PLAN_GUIDANCE_ANCHORS.basics}
        >
          {mode === "create" ? (
            <div className="space-y-1">
              <OrderCustomerPicker
                value={form.userId}
                disabled={isLoading}
                onSelect={(user) => {
                  setUserError(undefined);
                  setAddressError(undefined);
                  updateForm((current) => ({
                    ...current,
                    userId: user.id,
                    userAddressId: null,
                  }));
                }}
                onClear={() =>
                  updateForm((current) => ({
                    ...current,
                    userId: null,
                    userAddressId: null,
                  }))
                }
              />
              {userError ? <p className="text-xs text-destructive">{userError}</p> : null}
            </div>
          ) : (
            <TextField
              label={t.carePlanCustomer}
              value={entity ? getCarePlanCustomerLabel(entity) : String(form.userId ?? "")}
              disabled
              dir={
                entity && looksLikePhoneNumber(getCarePlanCustomerLabel(entity))
                  ? "ltr"
                  : undefined
              }
            />
          )}

          <CarePlanUserAddressPicker
            userId={form.userId}
            value={form.userAddressId}
            required
            error={addressError}
            disabled={isLoading}
            onSelect={(address) => {
              setAddressError(undefined);
              updateForm((current) => ({
                ...current,
                userAddressId: address.id,
                deliveryZonePriceId:
                  current.deliveryZonePriceId ?? address.deliveryZoneId ?? null,
              }));
            }}
            onClear={() =>
              updateForm((current) => ({
                ...current,
                userAddressId: null,
              }))
            }
          />

          <SelectField
            label={t.carePlanPaymentProvider}
            value={form.paymentProviderId == null ? "" : String(form.paymentProviderId)}
            onValueChange={(value) => {
              setPaymentError(undefined);
              updateForm((current) => ({
                ...current,
                paymentProviderId: value ? Number(value) : null,
              }));
            }}
            options={paymentProviderOptions}
            placeholder={t.selectPaymentProvider}
            required
            error={paymentError}
            disabled={isLoading}
          />

          <SelectField
            label={t.carePlanFrequency}
            value={form.frequency}
            onValueChange={(value) => {
              setFrequencyError(undefined);
              updateForm((current) => ({
                ...current,
                frequency: (value as CarePlanFormData["frequency"]) || "",
              }));
            }}
            options={frequencyOptions}
            placeholder={t.selectFrequency}
            required
            error={frequencyError}
            disabled={isLoading}
          />

          <SelectField
            label={t.carePlanPreferredWeekday}
            value={form.preferredWeekday == null ? UNSET_WEEKDAY_VALUE : String(form.preferredWeekday)}
            onValueChange={(value) => {
              updateForm((current) => ({
                ...current,
                preferredWeekday: value === UNSET_WEEKDAY_VALUE ? null : Number(value),
              }));
            }}
            options={weekdayOptions}
            placeholder={t.notSet}
            disabled={isLoading}
          />
        </CrudRecordSection>
      ) : null}

      {activeSection === "delivery" ? (
        <CrudRecordSection
          title={t.carePlanDeliverySection}
          description={t.carePlanDeliverySectionHint}
          as="h2"
          dataGuidance={CARE_PLAN_GUIDANCE_ANCHORS.delivery}
        >
          <OrderDeliveryZonePicker
            value={form.deliveryZonePriceId}
            disabled={isLoading}
            onSelect={(zone) =>
              updateForm((current) => ({
                ...current,
                deliveryZonePriceId: zone.id,
              }))
            }
            onClear={() =>
              updateForm((current) => ({
                ...current,
                deliveryZonePriceId: null,
              }))
            }
          />
        </CrudRecordSection>
      ) : null}

      {activeSection === "items" ? (
        <CrudRecordSection
          title={t.carePlanItemsSection}
          description={t.carePlanItemsSectionHint}
          as="h2"
          dataGuidance={CARE_PLAN_GUIDANCE_ANCHORS.items}
        >
          <CarePlanItemsEditor
            items={form.items}
            onChange={(items) => {
              setItemsError(undefined);
              updateForm((current) => ({ ...current, items }));
            }}
            disabled={isLoading}
            error={itemsError}
          />
        </CrudRecordSection>
      ) : null}
    </CrudRecordWorkspace>
  );
}
