import { FileText, Package, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ROUTES } from "@/app/router/routes";
import { OrderCustomerPicker } from "@/features/orders/components/OrderCustomerPicker";
import { PrescriptionDocumentPreview } from "@/features/prescriptions/components/PrescriptionDocumentPreview";
import { PrescriptionProductPicker } from "@/features/prescriptions/components/PrescriptionProductPicker";
import type {
  Prescription,
  PrescriptionFormData,
  PrescriptionFormSectionId,
} from "@/features/prescriptions/types/prescriptions.types";
import {
  createEmptyPrescriptionForm,
  getPrescriptionCustomerLabel,
  isPrescriptionRejected,
  PRESCRIPTION_STATUS,
  prescriptionToFormData,
} from "@/features/prescriptions/types/prescriptions.types";
import { AppButton, SelectField, TextAreaField, UserLabelText } from "@/shared/components";
import { CrudFileUpload, CrudRecordSection, CrudRecordWorkspace } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  CRUD_FORM_FIELD_ANCHORS,
  PRESCRIPTION_GUIDANCE_ANCHORS,
} from "@/shared/guidance/constants/guidance.constants";
import { usePrescriptionStatusOptions } from "@/shared/hooks/use-options";

type PrescriptionFormProps = {
  mode: "create" | "edit";
  entity?: Prescription | null;
  hydrateKey?: number;
  initialSection?: PrescriptionFormSectionId;
  isLoading?: boolean;
  onSubmit: (
    data: PrescriptionFormData,
    originalForm?: PrescriptionFormData,
  ) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

export function PrescriptionForm({
  mode,
  entity,
  hydrateKey = 0,
  initialSection,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: PrescriptionFormProps) {
  const t = useTranslation();
  const { options: statusOptions } = usePrescriptionStatusOptions();
  const [form, setForm] = useState<PrescriptionFormData>(() =>
    mode === "edit" && entity ? prescriptionToFormData(entity) : createEmptyPrescriptionForm(),
  );
  const [initialForm, setInitialForm] = useState<PrescriptionFormData | null>(
    mode === "edit" && entity ? prescriptionToFormData(entity) : null,
  );
  const [activeSection, setActiveSection] = useState<PrescriptionFormSectionId>(
    initialSection ?? (mode === "edit" ? "products" : "customer"),
  );
  const [userError, setUserError] = useState<string>();
  const [fileError, setFileError] = useState<string>();
  const [isDirty, setIsDirty] = useState(false);
  const persistInFlightRef = useRef(false);
  const rejected = isPrescriptionRejected(form.status);
  const currentFileUrl = mode === "edit" && !form.file ? entity?.fileUrl : null;

  useEffect(() => {
    if (mode !== "edit" || !entity) return;
    const next = prescriptionToFormData(entity);
    setForm(next);
    setInitialForm(next);
    setIsDirty(false);
    onDirtyChange?.(false);
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [entity, hydrateKey, initialSection, mode, onDirtyChange]);

  const updateForm = (updater: (current: PrescriptionFormData) => PrescriptionFormData) => {
    setForm((current) => {
      const next = updater(current);
      setIsDirty(true);
      onDirtyChange?.(true);
      return next;
    });
  };

  const validate = (): PrescriptionFormSectionId | null => {
    let nextUserError: string | undefined;
    let nextFileError: string | undefined;

    if (mode === "create" && form.userId == null) {
      nextUserError = t.prescriptionCustomerRequired;
    }
    if (mode === "create" && !form.file) {
      nextFileError = t.prescriptionFileRequired;
    }

    setUserError(nextUserError);
    setFileError(nextFileError);

    if (nextUserError) return "customer";
    if (nextFileError) return "document";
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
      ? t.addPrescription
      : entity
        ? entity.prescriptionNumber || getPrescriptionCustomerLabel(entity, t.editPrescription)
        : t.editPrescription;

  const sectionItems: {
    id: PrescriptionFormSectionId;
    label: string;
    icon: typeof FileText;
    error?: boolean;
  }[] = [
    {
      id: "customer",
      label: t.prescriptionCustomerSection,
      icon: UserRound,
      error: Boolean(userError),
    },
    {
      id: "document",
      label: t.prescriptionDocumentSection,
      icon: FileText,
      error: Boolean(fileError),
    },
    {
      id: "products",
      label: t.prescriptionProductsSection,
      icon: Package,
    },
  ];

  const statusLabel =
    statusOptions.find((option) => option.value === form.status)?.label || form.status || t.notSet;

  return (
    <CrudRecordWorkspace
      asForm
      onSubmit={handleSubmit}
      onPersist={persist}
      workspaceGuidance={PRESCRIPTION_GUIDANCE_ANCHORS.workspace}
      breadcrumbHref={ROUTES.admin.prescriptions}
      breadcrumbLabel={t.prescriptions}
      title={title}
      subtitle={t.prescriptionWorkspaceHint}
      meta={
        entity ? (
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {entity.prescriptionNumber || `${t.idLabel}: ${entity.id}`}
          </span>
        ) : null
      }
      dirty={isDirty}
      dirtyLabel={t.prescriptionUnsaved}
      onBack={onCancel}
      backLabel={t.backToPrescriptions}
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
            {mode === "create" ? t.addPrescription : t.save}
          </AppButton>
        </>
      }
      sections={sectionItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      sectionsAriaLabel={t.prescriptionFormSections}
      sectionsGuidance={PRESCRIPTION_GUIDANCE_ANCHORS.sectionNav}
      aside={
        <aside className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          {currentFileUrl ? (
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t.prescriptionCurrentFile}
              </p>
              <PrescriptionDocumentPreview fileUrl={currentFileUrl} compact />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground">
                <FileText className="size-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {mode === "create" ? t.addPrescription : t.editPrescription}
                </p>
                <p className="text-xs text-muted-foreground">{t.prescriptionFormPreviewHint}</p>
              </div>
            </div>
          )}
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t.status}</dt>
              <dd className="font-medium text-foreground">{statusLabel}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t.prescriptionProductsCount}</dt>
              <dd className="font-medium text-foreground">{form.productIds.length}</dd>
            </div>
          </dl>
        </aside>
      }
    >
      {activeSection === "customer" ? (
        <CrudRecordSection
          title={t.prescriptionCustomerSection}
          description={t.prescriptionCustomerSectionHint}
          as="h2"
          dataGuidance={PRESCRIPTION_GUIDANCE_ANCHORS.customer}
        >
          {mode === "create" ? (
            <div className="space-y-1">
              <OrderCustomerPicker
                value={form.userId}
                disabled={isLoading}
                onSelect={(user) => {
                  setUserError(undefined);
                  updateForm((current) => ({ ...current, userId: user.id }));
                }}
                onClear={() => updateForm((current) => ({ ...current, userId: null }))}
              />
              {userError ? <p className="text-xs text-destructive">{userError}</p> : null}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                <UserLabelText
                  value={
                    entity
                      ? getPrescriptionCustomerLabel(entity, t.notSet)
                      : t.notSet
                  }
                />
              </p>
              {entity?.customer?.email ? (
                <p className="text-sm text-muted-foreground">{entity.customer.email}</p>
              ) : null}
              {entity?.customer?.phoneNumber ? (
                <p className="text-sm text-muted-foreground">{entity.customer.phoneNumber}</p>
              ) : null}
            </div>
          )}
        </CrudRecordSection>
      ) : null}

      {activeSection === "document" ? (
        <CrudRecordSection
          title={t.prescriptionDocumentSection}
          description={t.prescriptionDocumentSectionHint}
          as="h2"
          dataGuidance={PRESCRIPTION_GUIDANCE_ANCHORS.document}
        >
          {currentFileUrl ? (
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t.prescriptionCurrentFile}
              </p>
              <PrescriptionDocumentPreview fileUrl={currentFileUrl} />
            </div>
          ) : null}
          <CrudFileUpload
            label={t.prescriptionFile}
            accept="image/png,image/jpeg,application/pdf"
            helperText={t.prescriptionFileHint}
            error={fileError}
            disabled={isLoading}
            value={form.file}
            onFileSelect={(file) => {
              setFileError(undefined);
              updateForm((current) => ({ ...current, file }));
            }}
          />
        </CrudRecordSection>
      ) : null}

      {activeSection === "products" ? (
        <CrudRecordSection
          title={t.prescriptionProductsSection}
          description={t.prescriptionProductsSectionHint}
          as="h2"
          dataGuidance={PRESCRIPTION_GUIDANCE_ANCHORS.products}
        >
          {rejected ? (
            <p className="text-sm text-muted-foreground">{t.prescriptionProductsRejectedHint}</p>
          ) : (
            <PrescriptionProductPicker
              value={form.productIds}
              seedItems={(entity?.products ?? []).map((product) => ({
                id: product.id,
                title: product.title,
              }))}
              seedImageUrls={Object.fromEntries(
                (entity?.products ?? []).map((product) => [product.id, product.imageFileUrl]),
              )}
              disabled={isLoading}
              onChange={(productIds) =>
                updateForm((current) => ({
                  ...current,
                  productIds,
                  status:
                    productIds.length > 0 ? PRESCRIPTION_STATUS.APPROVED : current.status,
                }))
              }
            />
          )}

          <div className="space-y-4 border-t border-border/60 pt-5" data-guidance={PRESCRIPTION_GUIDANCE_ANCHORS.review}>
            <SelectField
              label={t.status}
              value={form.status}
              options={statusOptions}
              disabled={isLoading}
              helperText={t.prescriptionAssignApprovesHint}
              onValueChange={(value) =>
                updateForm((current) => ({
                  ...current,
                  status: value,
                  productIds: value === PRESCRIPTION_STATUS.REJECTED ? [] : current.productIds,
                }))
              }
            />
            <TextAreaField
              label={t.pharmacistNote}
              value={form.notes}
              disabled={isLoading}
              rows={4}
              onChange={(event) =>
                updateForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </div>
        </CrudRecordSection>
      ) : null}
    </CrudRecordWorkspace>
  );
}
