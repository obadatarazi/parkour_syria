import { CalendarRange, Gift, TicketPercent } from "lucide-react";
import { type FormEvent,useEffect, useMemo, useRef, useState } from "react";

import { ROUTES } from "@/app/router/routes";
import { BogoDealsPanel } from "@/features/promotions/components/BogoDealsPanel";
import type { Promotion, PromotionFormData } from "@/features/promotions/types/promotions.types";
import {
  createEmptyPromotionForm,
  promotionToFormData,
} from "@/features/promotions/types/promotions.types";
import {
  AppButton,
  DatePickerField,
  TextField,
  ToggleField,
  TranslationFields,
} from "@/shared/components";
import { CrudRecordSection, CrudRecordWorkspace } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

type PromotionFormSectionId = "offer" | "schedule" | "deals";

type PromotionFormProps = {
  mode: "create" | "edit";
  entity?: Promotion | null;
  hydrateKey?: number;
  isLoading?: boolean;
  canManageDeals?: boolean;
  onSubmit: (data: PromotionFormData, originalForm?: PromotionFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onDealsChanged?: () => void | Promise<void>;
};

export function PromotionForm({
  mode,
  entity,
  hydrateKey = 0,
  isLoading,
  canManageDeals = false,
  onSubmit,
  onCancel,
  onDirtyChange,
  onDealsChanged,
}: PromotionFormProps) {
  const t = useTranslation();
  const [activeSection, setActiveSection] = useState<PromotionFormSectionId>("offer");
  const [form, setForm] = useState<PromotionFormData>(createEmptyPromotionForm());
  const [initialForm, setInitialForm] = useState<PromotionFormData | null>(null);
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [codeError, setCodeError] = useState<string>();
  const [isDirty, setIsDirty] = useState(false);
  const entityRef = useRef(entity);
  entityRef.current = entity;

  useEffect(() => {
    const source = entityRef.current;
    const nextForm = source ? promotionToFormData(source) : createEmptyPromotionForm();
    setForm(nextForm);
    setInitialForm(mode === "edit" ? nextForm : null);
    setTitleErrors({});
    setCodeError(undefined);
    setIsDirty(false);
  }, [hydrateKey, mode, entity?.id]);

  useEffect(() => {
    setActiveSection("offer");
  }, [mode, entity?.id]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (patch: Partial<PromotionFormData>) => {
    setForm((current) => ({ ...current, ...patch }));
    setIsDirty(true);
  };

  const validate = () => {
    const nextTitleErrors: Partial<Record<"en" | "ar", string>> = {};
    if (!form.translations.en?.title?.trim()) nextTitleErrors.en = t.required;
    if (!form.translations.ar?.title?.trim()) nextTitleErrors.ar = t.required;
    setTitleErrors(nextTitleErrors);

    let nextCodeError: string | undefined;
    if (!form.code.trim()) nextCodeError = t.required;
    setCodeError(nextCodeError);

    return Object.keys(nextTitleErrors).length === 0 && !nextCodeError;
  };

  const persist = () => {
    if (activeSection === "deals") return;
    if (!validate()) {
      setActiveSection("offer");
      return;
    }
    void onSubmit(form, initialForm ?? undefined);
  };

  const liveTitle = useMemo(() => {
    const bilingual = getBilingualTitle(form.translations, form.code || t.addPromotion);
    return formatBilingualLabel(bilingual) || form.code || t.addPromotion;
  }, [form.code, form.translations, t.addPromotion]);

  const sectionItems = [
    {
      id: "offer" as const,
      label: t.promotionOfferSection,
      icon: TicketPercent,
      error: Boolean(titleErrors.en || titleErrors.ar || codeError),
    },
    {
      id: "schedule" as const,
      label: t.promotionScheduleSection,
      icon: CalendarRange,
    },
    ...(mode === "edit" && entity?.id
      ? [
          {
            id: "deals" as const,
            label: t.bogoDeals,
            icon: Gift,
          },
        ]
      : []),
  ];

  const isDealsSection = activeSection === "deals";

  return (
    <CrudRecordWorkspace
      {...(isDealsSection
        ? { asForm: false as const }
        : {
            asForm: true as const,
            onSubmit: (event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              persist();
            },
            onPersist: persist,
          })}
      breadcrumbHref={ROUTES.admin.promotions}
      breadcrumbLabel={t.promotions}
      title={liveTitle}
      subtitle={t.promotionWorkspaceHint}
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
      backLabel={t.backToPromotions}
      headerActions={
        <>
          <AppButton type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {t.cancel}
          </AppButton>
          {activeSection !== "deals" ? (
            <AppButton type="submit" isLoading={isLoading} loadingText={t.loadingMessage}>
              {mode === "create" ? t.addPromotion : t.save}
            </AppButton>
          ) : null}
        </>
      }
      sections={sectionItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      sectionsAriaLabel={t.promotionFormSections}
    >
      {activeSection === "offer" ? (
        <CrudRecordSection title={t.promotionOfferSection} description={t.promotionOfferSectionHint}>
          <div className="space-y-4">
            {codeError || titleErrors.en || titleErrors.ar ? (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {t.formFixHighlightedFields}
              </p>
            ) : null}
            <TranslationFields
              value={form.translations}
              onChange={(translations) => {
                setTitleErrors({});
                updateForm({ translations });
              }}
              titleErrors={titleErrors}
              layout="tabs"
              autoFocusFirstField={mode === "create"}
            />
            <TextField
              label={t.promotionCode}
              value={form.code}
              onChange={(event) => {
                setCodeError(undefined);
                updateForm({ code: event.target.value.toUpperCase() });
              }}
              error={codeError}
              required
            />
            <TextField
              label={t.bogoPromotionType}
              value={form.type}
              disabled
              helperText={t.promotionTypeHint}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <ToggleField
                label={t.promotionIsActive}
                checked={form.isActive}
                onCheckedChange={(checked) => updateForm({ isActive: checked })}
                description={t.promotionIsActiveHint}
              />
              <ToggleField
                label={t.promotionIsRequireLogin}
                checked={form.isRequireLogin}
                onCheckedChange={(checked) => updateForm({ isRequireLogin: checked })}
                description={t.promotionIsRequireLoginHint}
              />
            </div>
            <TextField
              label={t.promotionPriority}
              type="number"
              min={0}
              value={form.priority == null ? "" : String(form.priority)}
              onChange={(event) => {
                const raw = event.target.value;
                updateForm({ priority: raw === "" ? null : Math.max(0, Number(raw) || 0) });
              }}
              helperText={t.promotionPriorityHint}
            />
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "schedule" ? (
        <CrudRecordSection
          title={t.promotionScheduleSection}
          description={t.promotionScheduleSectionHint}
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DatePickerField
                label={t.promotionStartsAt}
                mode="datetime"
                value={form.startsAt}
                onChange={(startsAt) => updateForm({ startsAt })}
              />
              <DatePickerField
                label={t.promotionEndsAt}
                mode="datetime"
                value={form.endsAt}
                onChange={(endsAt) => updateForm({ endsAt })}
                min={form.startsAt || undefined}
              />
            </div>
            <p className="text-sm text-muted-foreground">{t.promotionLifetimeHint}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label={t.promotionUsageLimit}
                type="number"
                min={0}
                value={form.usageLimit == null ? "" : String(form.usageLimit)}
                onChange={(event) => {
                  const raw = event.target.value;
                  updateForm({ usageLimit: raw === "" ? null : Math.max(0, Number(raw) || 0) });
                }}
                helperText={t.promotionUsageLimitHint}
              />
              <TextField
                label={t.promotionUsageLimitPerUser}
                type="number"
                min={0}
                value={form.usageLimitPerUser == null ? "" : String(form.usageLimitPerUser)}
                onChange={(event) => {
                  const raw = event.target.value;
                  updateForm({
                    usageLimitPerUser: raw === "" ? null : Math.max(0, Number(raw) || 0),
                  });
                }}
                helperText={t.promotionUsageLimitPerUserHint}
              />
            </div>
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "deals" && entity?.id ? (
        <CrudRecordSection title={t.bogoDeals} description={t.bogoDealsHint}>
          <BogoDealsPanel
            promotionId={entity.id}
            canCreate={canManageDeals}
            canUpdate={canManageDeals}
            canDelete={canManageDeals}
            onChanged={onDealsChanged}
          />
        </CrudRecordSection>
      ) : null}
    </CrudRecordWorkspace>
  );
}
