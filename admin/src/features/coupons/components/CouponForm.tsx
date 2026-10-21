import {
  BadgeDollarSign,
  CalendarRange,
  Copy,
  ExternalLink,
  Percent,
  Target,
  TicketPercent,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ROUTES } from "@/app/router/routes";
import { BrandMultiPicker } from "@/features/coupons/components/BrandMultiPicker";
import { CouponFormPreviewCard } from "@/features/coupons/components/CouponFormPreviewCard";
import { CouponProductVariantPicker } from "@/features/coupons/components/CouponProductVariantPicker";
import { CouponUserBindings } from "@/features/coupons/components/CouponUserBindings";
import { ProductMultiPicker } from "@/features/coupons/components/ProductMultiPicker";
import type { Coupon, CouponFormData, CouponScopeValue } from "@/features/coupons/types/coupons.types";
import {
  couponToFormData,
  createEmptyCouponForm,
} from "@/features/coupons/types/coupons.types";
import { normalizeCouponFormForApi } from "@/features/coupons/utils/coupon-admin-scope";
import {
  type CouponFormSectionId,
  formatCouponOfferOneLiner,
  getCouponFormCompleteness,
} from "@/features/coupons/utils/coupon-form-completeness";
import { getCouponShareUrl } from "@/features/coupons/utils/coupon-share-url";
import { CategoryMultiPicker } from "@/features/products/components/CategoryMultiPicker";
import { TagMultiPicker } from "@/features/products/components/TagMultiPicker";
import {
  AppButton,
  DatePickerField,
  FormField,
  SelectField,
  TextField,
  ToggleField,
  TranslationFields,
} from "@/shared/components";
import { CrudRecordSection, CrudRecordWorkspace } from "@/shared/crud";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  COUPON_FORM_ANCHORS,
  CRUD_FORM_FIELD_ANCHORS,
} from "@/shared/guidance/constants/guidance.constants";
import {
  useCouponApplicableToOptions,
  useCouponAudienceOptions,
  useCouponStatusOptions,
} from "@/shared/hooks/use-options";
import { notify } from "@/shared/lib/notifications";

type CouponFormProps = {
  mode: "create" | "edit";
  entity?: Coupon | null;
  hydrateKey?: number;
  isLoading?: boolean;
  onSubmit: (data: CouponFormData, originalForm?: CouponFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

type OfferType = "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";

function OfferTypePicker({
  value,
  onChange,
}: {
  value: OfferType;
  onChange: (value: OfferType) => void;
}) {
  const t = useTranslation();
  const options = [
    {
      value: "PERCENTAGE" as const,
      label: t.couponOfferPercentage,
      description: t.couponOfferPercentageHint,
      icon: Percent,
    },
    {
      value: "FIXED" as const,
      label: t.couponOfferFixed,
      description: t.couponOfferFixedHint,
      icon: BadgeDollarSign,
    },
    {
      value: "FREE_SHIPPING" as const,
      label: t.couponOfferFreeShipping,
      description: t.couponOfferFreeShippingHint,
      icon: Truck,
    },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const selected = value === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-xl border p-3 text-start transition-colors",
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted/60",
            )}
          >
            <Icon className="mb-2 size-5" aria-hidden="true" />
            <span className="block text-sm font-semibold">{option.label}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}

function CatalogBindings({
  form,
  catalogOptions,
  applicableError,
  bindingsError,
  productSeeds,
  brandSeeds,
  categorySeeds,
  tagSeeds,
  entity,
  onToggle,
  onUpdate,
  optionalHint,
}: {
  form: CouponFormData;
  catalogOptions: Array<{ value: string; label: string }>;
  applicableError?: string;
  bindingsError?: string;
  productSeeds: Array<{ id: number; title: string }>;
  brandSeeds: Array<{ id: number; title: string }>;
  categorySeeds: Array<{ id: number; title: string }>;
  tagSeeds: Array<{ id: number; title: string }>;
  entity?: Coupon | null;
  onToggle: (value: string) => void;
  onUpdate: (patch: Partial<CouponFormData>) => void;
  optionalHint?: string;
}) {
  const t = useTranslation();

  return (
    <>
      {applicableError ? <p className="text-sm text-destructive">{applicableError}</p> : null}
      <div className="flex flex-wrap gap-2">
        {catalogOptions.map((option) => {
          const selected = form.applicableTo.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/60",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{optionalHint ?? t.couponAppliesToOrHint}</p>
      {bindingsError ? <p className="text-sm text-destructive">{bindingsError}</p> : null}

      {form.applicableTo.includes("PRODUCT") ? (
        <div className="space-y-3">
          <ProductMultiPicker
            value={form.productIds}
            seedItems={productSeeds}
            onChange={(productIds) => onUpdate({ productIds })}
          />
          <CouponProductVariantPicker
            productIds={form.productIds}
            value={form.productVariantIds}
            seedItems={entity?.productVariants}
            onChange={(productVariantIds) => onUpdate({ productVariantIds })}
          />
        </div>
      ) : null}

      {form.applicableTo.includes("BRAND") ? (
        <BrandMultiPicker
          value={form.brandIds}
          seedItems={brandSeeds}
          onChange={(brandIds) => onUpdate({ brandIds })}
        />
      ) : null}

      {form.applicableTo.includes("CATEGORY") ? (
        <CategoryMultiPicker
          value={form.categoryIds}
          seedItems={categorySeeds}
          onChange={(categoryIds) => onUpdate({ categoryIds })}
        />
      ) : null}

      {form.applicableTo.includes("TAG") ? (
        <TagMultiPicker
          value={form.tagIds}
          seedItems={tagSeeds}
          onChange={(tagIds) => onUpdate({ tagIds })}
        />
      ) : null}
    </>
  );
}

export function CouponForm({
  mode,
  entity,
  hydrateKey = 0,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: CouponFormProps) {
  const t = useTranslation();
  const persistInFlightRef = useRef(false);
  const offerAlertRef = useRef<HTMLDivElement>(null);
  const [validationTick, setValidationTick] = useState(0);
  const { options: statusOptions } = useCouponStatusOptions();
  const { options: audienceOptions } = useCouponAudienceOptions();
  const { options: applicableToOptions } = useCouponApplicableToOptions();

  const [form, setForm] = useState<CouponFormData>(() =>
    entity ? couponToFormData(entity) : createEmptyCouponForm(),
  );
  const [initialForm, setInitialForm] = useState<CouponFormData | null>(null);
  const [activeSection, setActiveSection] = useState<CouponFormSectionId>("offer");
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [codeError, setCodeError] = useState<string>();
  const [valueError, setValueError] = useState<string>();
  const [applicableError, setApplicableError] = useState<string>();
  const [bindingsError, setBindingsError] = useState<string>();
  const [usersError, setUsersError] = useState<string>();
  const [limitsError, setLimitsError] = useState<string>();
  const [isDirty, setIsDirty] = useState(false);
  const entityRef = useRef(entity);
  entityRef.current = entity;

  useEffect(() => {
    const source = entityRef.current;
    const nextForm = source ? couponToFormData(source) : createEmptyCouponForm();
    setForm(nextForm);
    setInitialForm(mode === "edit" ? nextForm : null);
    setTitleErrors({});
    setCodeError(undefined);
    setValueError(undefined);
    setApplicableError(undefined);
    setBindingsError(undefined);
    setUsersError(undefined);
    setLimitsError(undefined);
    setIsDirty(false);
  }, [hydrateKey, mode, entity?.id]);

  useEffect(() => {
    setActiveSection("offer");
  }, [mode, entity?.id]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!validationTick) return;
    offerAlertRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    if (activeSection !== "offer") return;
    const codeInput = offerAlertRef.current?.querySelector<HTMLInputElement>(
      "[data-coupon-code-field] input",
    );
    codeInput?.focus();
  }, [validationTick, activeSection]);

  const updateForm = (patch: Partial<CouponFormData> | ((current: CouponFormData) => CouponFormData)) => {
    setForm((current) => {
      const next = typeof patch === "function" ? patch(current) : { ...current, ...patch };
      return next;
    });
    setIsDirty(true);
  };

  const setScope = (scope: CouponScopeValue) => {
    updateForm((current) => {
      if (scope === "CART") {
        return {
          ...current,
          scope,
          type: current.type === "FREE_SHIPPING" ? "PERCENTAGE" : current.type,
          applicableTo: [],
          productIds: [],
          productVariantIds: [],
          brandIds: [],
          categoryIds: [],
          tagIds: [],
        };
      }
      if (scope === "SHIPPING") {
        return {
          ...current,
          scope,
          type: "FREE_SHIPPING",
          value: "",
        };
      }
      return {
        ...current,
        scope,
        type: current.type === "FREE_SHIPPING" ? "PERCENTAGE" : current.type,
      };
    });
  };

  const showValue = form.type !== "FREE_SHIPPING" && form.scope !== "SHIPPING";
  const isShipping = form.scope === "SHIPPING" || form.type === "FREE_SHIPPING";
  const isSpecificUsers = form.audience === "SPECIFIC_USERS";
  const valueSuffix = form.type === "PERCENTAGE" ? "%" : "KWD";
  const catalogOptions = applicableToOptions.filter((option) => option.value !== "USER");

  const productSeeds = useMemo(
    () => (entity?.products ?? []).map((item) => ({ id: item.id, title: item.title ?? `#${item.id}` })),
    [entity?.products],
  );
  const brandSeeds = useMemo(
    () => (entity?.brands ?? []).map((item) => ({ id: item.id, title: item.title ?? `#${item.id}` })),
    [entity?.brands],
  );
  const categorySeeds = useMemo(
    () =>
      (entity?.categories ?? []).map((item) => ({
        id: item.id,
        title: item.title ?? `#${item.id}`,
      })),
    [entity?.categories],
  );
  const tagSeeds = useMemo(
    () => (entity?.tags ?? []).map((item) => ({ id: item.id, title: item.title ?? `#${item.id}` })),
    [entity?.tags],
  );

  const toggleApplicableTo = (value: string) => {
    updateForm((current) => {
      const selected = current.applicableTo.includes(value)
        ? current.applicableTo.filter((item) => item !== value)
        : [...current.applicableTo, value];

      const next: CouponFormData = { ...current, applicableTo: selected };
      if (!selected.includes("PRODUCT")) {
        next.productIds = [];
        next.productVariantIds = [];
      }
      if (!selected.includes("BRAND")) next.brandIds = [];
      if (!selected.includes("CATEGORY")) next.categoryIds = [];
      if (!selected.includes("TAG")) next.tagIds = [];
      return next;
    });
  };

  const copyCode = async () => {
    if (!form.code.trim()) return;
    try {
      await navigator.clipboard.writeText(form.code.trim().toUpperCase());
      notify.success(t.couponCodeCopied);
    } catch {
      notify.error(t.errorMessage);
    }
  };

  const couponShareUrl = getCouponShareUrl(form.code);
  const displayCouponUrl = couponShareUrl ?? (form.couponUrl.trim() || "");
  const hasMinimumCartSpend =
    form.minimumTotalPrice != null && Number.isFinite(form.minimumTotalPrice) && form.minimumTotalPrice > 0;

  const copyCouponUrl = async () => {
    if (!displayCouponUrl || hasMinimumCartSpend) return;
    try {
      await navigator.clipboard.writeText(displayCouponUrl);
      notify.success(t.couponUrlCopied);
    } catch {
      notify.error(t.errorMessage);
    }
  };

  const validate = (): CouponFormSectionId | null => {
    const nextTitleErrors: Partial<Record<"en" | "ar", string>> = {};
    if (!form.translations.en?.title?.trim()) nextTitleErrors.en = t.required;
    if (!form.translations.ar?.title?.trim()) nextTitleErrors.ar = t.required;
    setTitleErrors(nextTitleErrors);

    let nextCodeError: string | undefined;
    if (!form.code.trim()) nextCodeError = t.required;
    setCodeError(nextCodeError);

    let nextValueError: string | undefined;
    if (showValue) {
      const raw = form.value.trim();
      if (!raw) nextValueError = t.required;
      else if (!Number.isFinite(Number(raw)) || Number(raw) <= 0) {
        nextValueError = t.couponValueInvalid;
      } else if (form.type === "PERCENTAGE" && Number(raw) > 100) {
        nextValueError = t.couponPercentageMax;
      }
    }
    setValueError(nextValueError);

    let nextApplicableError: string | undefined;
    let nextBindingsError: string | undefined;
    let nextUsersError: string | undefined;
    let nextLimitsError: string | undefined;

    if (isSpecificUsers && (form.users.length === 0 || form.users.some((user) => user.userId == null))) {
      nextUsersError = t.couponUsersRequired;
    }

    if (
      (form.usageLimit != null && form.usageLimit < 1) ||
      (form.usageLimitPerUser != null && form.usageLimitPerUser < 1) ||
      form.users.some((user) => user.userId != null && user.usageLimit < 1)
    ) {
      nextLimitsError = t.couponUsageLimitMin;
    }

    if (form.scope === "ITEMS") {
      const selectedCatalog = form.applicableTo.filter((item) => item !== "USER");
      if (selectedCatalog.length === 0) nextApplicableError = t.couponApplicableToRequired;
      else if (
        selectedCatalog.includes("PRODUCT") &&
        form.productIds.length === 0 &&
        form.productVariantIds.length === 0
      ) {
        nextBindingsError = t.couponProductsRequired;
      } else if (selectedCatalog.includes("BRAND") && form.brandIds.length === 0) {
        nextBindingsError = t.couponBrandsRequired;
      } else if (selectedCatalog.includes("CATEGORY") && form.categoryIds.length === 0) {
        nextBindingsError = t.couponCategoriesRequired;
      } else if (selectedCatalog.includes("TAG") && form.tagIds.length === 0) {
        nextBindingsError = t.couponTagsRequired;
      }
    }

    setApplicableError(nextApplicableError);
    setBindingsError(nextBindingsError);
    setUsersError(nextUsersError);
    setLimitsError(nextLimitsError);

    if (Object.keys(nextTitleErrors).length > 0 || nextCodeError || nextValueError) return "offer";
    if (nextUsersError) return "audience";
    if (nextLimitsError) return "schedule";
    if (nextApplicableError || nextBindingsError) return "appliesTo";
    return null;
  };

  const persist = () => {
    if (isLoading || persistInFlightRef.current) return;
    const errorSection = validate();
    if (errorSection) {
      setActiveSection(errorSection);
      setValidationTick((tick) => tick + 1);
      return;
    }
    const code = form.code.trim().toUpperCase();
    persistInFlightRef.current = true;
    void Promise.resolve(
      onSubmit(
        normalizeCouponFormForApi({
          ...form,
          code,
          couponUrl: getCouponShareUrl(code) ?? "",
          value: showValue ? form.value.trim() : "",
        }),
        initialForm ?? undefined,
      ),
    ).finally(() => {
      persistInFlightRef.current = false;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    persist();
  };

  const scopeDescription = isShipping
    ? t.couponAppliesToShippingHint
    : t.couponAppliesToSectionHint;

  const completeness = getCouponFormCompleteness(form);
  const liveTitle =
    form.code.trim() ||
    form.translations.en?.title?.trim() ||
    form.translations.ar?.title?.trim() ||
    (mode === "create" ? t.addCoupon : t.editCoupon);
  const statusLabel =
    statusOptions.find((option) => option.value === form.status)?.label || form.status || t.notSet;
  const audienceLabel =
    audienceOptions.find((option) => option.value === form.audience)?.label ||
    form.audience ||
    t.notSet;
  const appliesToChips = (() => {
    if (isShipping) return [t.couponOfferFreeShipping];
    if (form.scope === "CART") return [t.couponGoodsTargetCart];
    return catalogOptions
      .filter((option) => form.applicableTo.includes(option.value))
      .map((option) => option.label);
  })();
  const offerLine = formatCouponOfferOneLiner(form, {
    freeShipping: t.couponOfferFreeShipping,
    percentOff: "{value}%",
    fixedOff: "{value} KWD",
    empty: "—",
  });

  const sectionItems: {
    id: CouponFormSectionId;
    label: string;
    icon: typeof TicketPercent;
    error?: boolean;
    guidance?: string;
  }[] = [
    {
      id: "offer",
      label: t.couponOfferSection,
      icon: TicketPercent,
      error: Boolean(titleErrors.en || titleErrors.ar || codeError || valueError),
    },
    {
      id: "audience",
      label: t.couponRulesSection,
      icon: Users,
      error: Boolean(usersError),
      guidance: COUPON_FORM_ANCHORS.rules,
    },
    {
      id: "schedule",
      label: t.couponAdvancedRules,
      icon: CalendarRange,
      error: Boolean(limitsError),
    },
    {
      id: "appliesTo",
      label: t.couponAppliesToSection,
      icon: Target,
      error: Boolean(applicableError || bindingsError),
    },
  ];

  const completenessLabels: Record<string, string> = {
    code: t.couponCode,
    titles: t.titleEnglish,
    value: t.couponValue,
    audience: t.couponAudience,
    appliesTo: t.couponAppliesToSection,
  };

  return (
    <CrudRecordWorkspace
      asForm
      onSubmit={handleSubmit}
      onPersist={persist}
      workspaceGuidance={COUPON_FORM_ANCHORS.workspace}
      breadcrumbHref={ROUTES.admin.coupons}
      breadcrumbLabel={t.coupons}
      title={liveTitle}
      subtitle={t.couponWorkspaceHint}
      meta={
        entity?.id ? (
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {t.idLabel}: {entity.id}
          </span>
        ) : null
      }
      dirty={isDirty}
      dirtyLabel={t.couponUnsaved}
      onBack={onCancel}
      backLabel={t.backToCoupons}
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
            {mode === "create" ? t.addCoupon : t.save}
          </AppButton>
        </>
      }
      sections={sectionItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      sectionsAriaLabel={t.couponFormSections}
      sectionsGuidance={COUPON_FORM_ANCHORS.sectionNav}
      aside={
        <CouponFormPreviewCard
          code={form.code}
          offerLine={offerLine}
          statusLabel={statusLabel}
          audienceLabel={audienceLabel}
          appliesToChips={appliesToChips}
          hasMinimumCartSpend={hasMinimumCartSpend}
          completeness={completeness}
          completenessLabels={completenessLabels}
          onJumpToSection={setActiveSection}
        />
      }
    >
      {activeSection === "offer" ? (
        <CrudRecordSection
          title={t.couponOfferSection}
          description={t.couponOfferSectionHint}
          as="h2"
        >
          <div ref={offerAlertRef} className="space-y-4">
          {codeError || titleErrors.en || titleErrors.ar || valueError ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {t.formFixHighlightedFields}
            </p>
          ) : null}

          <div className="space-y-3" data-coupon-code-field="">
            <div className="flex gap-2">
              <TextField
                label={t.couponCode}
                value={form.code}
                onChange={(event) => {
                  const code = event.target.value.toUpperCase().replace(/\s+/g, "");
                  updateForm({
                    code,
                    couponUrl: getCouponShareUrl(code) ?? "",
                  });
                }}
                error={codeError}
                required
                containerClassName="flex-1"
                autoFocus
              />
              <div className="flex items-end pb-0.5">
                <AppButton
                  type="button"
                  variant="outline"
                  onClick={() => void copyCode()}
                  disabled={!form.code.trim()}
                  aria-label={t.copyCouponCode}
                >
                  <Copy className="size-4" />
                </AppButton>
              </div>
            </div>

            {displayCouponUrl ? (
              <FormField
                fieldId="coupon-url"
                label={t.couponUrl}
                helperText={hasMinimumCartSpend ? t.couponUrlMinSpendHint : t.couponUrlHint}
              >
                <div className="flex gap-2">
                  <div
                    id="coupon-url"
                    className="flex min-w-0 flex-1 items-center rounded-md border border-input bg-muted/40 px-3 py-2"
                  >
                    <a
                      href={displayCouponUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-sm text-brand hover:underline"
                      title={displayCouponUrl}
                    >
                      {displayCouponUrl}
                    </a>
                  </div>
                  <AppButton
                    type="button"
                    variant="outline"
                    onClick={() => void copyCouponUrl()}
                    disabled={hasMinimumCartSpend}
                    title={hasMinimumCartSpend ? t.copyCouponUrlBlocked : t.copyCouponUrl}
                    aria-label={hasMinimumCartSpend ? t.copyCouponUrlBlocked : t.copyCouponUrl}
                  >
                    <Copy className="size-4" />
                  </AppButton>
                  <AppButton
                    type="button"
                    variant="outline"
                    onClick={() => window.open(displayCouponUrl, "_blank", "noopener,noreferrer")}
                    aria-label={t.openCouponUrl}
                  >
                    <ExternalLink className="size-4" />
                  </AppButton>
                </div>
              </FormField>
            ) : null}
          </div>

          <TranslationFields
            value={form.translations}
            onChange={(translations) => updateForm({ translations })}
            titleErrors={titleErrors}
            layout="tabs"
          />

          {showValue ? (
            <TextField
              label={t.couponValue}
              type="number"
              min={0}
              step="0.1"
              value={form.value}
              onChange={(event) => updateForm({ value: event.target.value })}
              error={valueError}
              helperText={form.type === "PERCENTAGE" ? t.couponPercentageHint : t.couponFixedCartHint}
              endAdornment={
                <span className="px-2 text-sm text-muted-foreground" aria-hidden="true">
                  {valueSuffix}
                </span>
              }
              required
            />
          ) : null}

          <OfferTypePicker
            value={(isShipping ? "FREE_SHIPPING" : form.type) as OfferType}
            onChange={(type) => {
              if (type === "FREE_SHIPPING") {
                setScope("SHIPPING");
                return;
              }
              updateForm({
                type,
                scope: form.scope === "SHIPPING" ? "CART" : form.scope,
              });
            }}
          />
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "audience" ? (
        <CrudRecordSection
          title={t.couponRulesSection}
          description={t.couponRulesSectionHint}
          as="h2"
          dataGuidance={COUPON_FORM_ANCHORS.rules}
        >
          <SelectField
            label={t.couponAudience}
            value={form.audience}
            onValueChange={(audience) => {
              updateForm({
                audience,
                users: audience === "SPECIFIC_USERS" ? form.users : [],
              });
            }}
            options={audienceOptions}
            helperText={t.couponAudienceHint}
          />

          {isSpecificUsers ? (
            <CouponUserBindings
              value={form.users}
              onChange={(users) => updateForm({ users })}
              error={usersError}
              disabled={isLoading}
            />
          ) : null}

          <div className="divide-y divide-border rounded-lg border border-border">
            <ToggleField
              className="px-3 py-3"
              label={t.couponIsAutoApply}
              checked={form.isAutoApply}
              onCheckedChange={(isAutoApply) => updateForm({ isAutoApply })}
              description={t.couponIsAutoApplyHint}
              disabled={isLoading}
            />
            <ToggleField
              className="px-3 py-3"
              label={t.couponIsFirstOrderOnly}
              checked={form.isFirstOrderOnly}
              onCheckedChange={(isFirstOrderOnly) => updateForm({ isFirstOrderOnly })}
              disabled={isLoading}
            />
            <ToggleField
              className="px-3 py-3"
              label={t.couponRequireLogin}
              checked={form.isRequireLogin}
              onCheckedChange={(isRequireLogin) => updateForm({ isRequireLogin })}
              disabled={isLoading}
            />
            <div data-guidance={COUPON_FORM_ANCHORS.staffOnly}>
              <ToggleField
                className="px-3 py-3"
                label={t.couponIsAdminOnly}
                checked={form.isAdminOnly}
                onCheckedChange={(isAdminOnly) => updateForm({ isAdminOnly })}
                description={t.couponIsAdminOnlyHint}
                disabled={isLoading}
              />
            </div>
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "schedule" ? (
        <CrudRecordSection
          title={t.couponAdvancedRules}
          description={t.couponAdvancedRulesHint}
          as="h2"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label={t.status}
              value={form.status}
              onValueChange={(status) => updateForm({ status })}
              options={statusOptions}
              required
            />
            <TextField
              label={t.couponMinimumTotalPrice}
              type="number"
              min={0}
              step="0.1"
              value={form.minimumTotalPrice == null ? "" : String(form.minimumTotalPrice)}
              onChange={(event) => {
                const raw = event.target.value;
                updateForm({ minimumTotalPrice: raw === "" ? null : Number(raw) });
              }}
              helperText={t.couponMinimumTotalPriceCartHint}
              endAdornment={
                <span className="px-2 text-sm text-muted-foreground" aria-hidden="true">
                  KWD
                </span>
              }
            />
            <DatePickerField
              label={t.couponStartsAt}
              mode="datetime"
              value={form.startsAt}
              onChange={(startsAt) => updateForm({ startsAt })}
            />
            <DatePickerField
              label={t.couponExpireAt}
              mode="datetime"
              value={form.expireAt}
              onChange={(expireAt) => updateForm({ expireAt })}
              min={form.startsAt || undefined}
            />
            <TextField
              label={t.couponUsageLimit}
              type="number"
              min={1}
              value={form.usageLimit == null ? "" : String(form.usageLimit)}
              onChange={(event) => {
                const raw = event.target.value;
                updateForm({ usageLimit: raw === "" ? null : Number(raw) });
              }}
              helperText={t.couponUsageLimitHint}
            />
            <TextField
              label={t.couponUsageLimitPerUser}
              type="number"
              min={1}
              value={form.usageLimitPerUser == null ? "" : String(form.usageLimitPerUser)}
              onChange={(event) => {
                const raw = event.target.value;
                updateForm({ usageLimitPerUser: raw === "" ? null : Number(raw) });
              }}
            />
            <TextField
              label={t.couponPriority}
              type="number"
              value={form.priority == null ? "" : String(form.priority)}
              onChange={(event) => {
                const raw = event.target.value;
                updateForm({ priority: raw === "" ? null : Number(raw) });
              }}
              helperText={t.couponPriorityHint}
            />
          </div>
          {limitsError ? <p className="text-sm text-destructive">{limitsError}</p> : null}
          <div className="divide-y divide-border rounded-lg border border-border bg-background">
            <ToggleField
              className="px-3 py-3"
              label={t.couponIsCombinable}
              checked={form.isCombinable}
              onCheckedChange={(isCombinable) => updateForm({ isCombinable })}
              disabled={isLoading}
            />
            <ToggleField
              className="px-3 py-3"
              label={t.couponNotifyUsers}
              checked={form.isNotifyUsers}
              onCheckedChange={(isNotifyUsers) => updateForm({ isNotifyUsers })}
              disabled={isLoading}
            />
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "appliesTo" ? (
        <CrudRecordSection title={t.couponAppliesToSection} description={scopeDescription} as="h2">
          {isShipping ? (
            <>
              <p className="text-sm text-muted-foreground">{t.couponAppliesToShippingNote}</p>
              <CatalogBindings
                form={form}
                catalogOptions={catalogOptions}
                applicableError={applicableError}
                bindingsError={bindingsError}
                productSeeds={productSeeds}
                brandSeeds={brandSeeds}
                categorySeeds={categorySeeds}
                tagSeeds={tagSeeds}
                entity={entity}
                onToggle={toggleApplicableTo}
                onUpdate={updateForm}
                optionalHint={t.couponShippingCatalogOptionalHint}
              />
            </>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setScope("CART")}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-start transition-colors",
                    form.scope === "CART"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:bg-muted/60",
                  )}
                >
                  <span className="block text-sm font-medium">{t.couponGoodsTargetCart}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {t.couponGoodsTargetCartHint}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setScope("ITEMS")}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-start transition-colors",
                    form.scope === "ITEMS"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:bg-muted/60",
                  )}
                >
                  <span className="block text-sm font-medium">{t.couponGoodsTargetItems}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {t.couponGoodsTargetItemsHint}
                  </span>
                </button>
              </div>

              {form.scope === "ITEMS" ? (
                <CatalogBindings
                  form={form}
                  catalogOptions={catalogOptions}
                  applicableError={applicableError}
                  bindingsError={bindingsError}
                  productSeeds={productSeeds}
                  brandSeeds={brandSeeds}
                  categorySeeds={categorySeeds}
                  tagSeeds={tagSeeds}
                  entity={entity}
                  onToggle={toggleApplicableTo}
                  onUpdate={updateForm}
                />
              ) : null}
            </>
          )}
        </CrudRecordSection>
      ) : null}
    </CrudRecordWorkspace>
  );
}
