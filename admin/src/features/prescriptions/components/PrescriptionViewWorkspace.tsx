import { FileText, Package, Pencil, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { prescriptionEditPath, ROUTES } from "@/app/router/routes";
import { PrescriptionDocumentPreview } from "@/features/prescriptions/components/PrescriptionDocumentPreview";
import type { Prescription } from "@/features/prescriptions/types/prescriptions.types";
import { getPrescriptionCustomerLabel } from "@/features/prescriptions/types/prescriptions.types";
import { getPrescriptionStatusVariant } from "@/features/prescriptions/utils/prescription-status.utils";
import {
  AppButton,
  MediaImage,
  PhoneNumberText,
  StatusBadge,
  UserLabelText,
} from "@/shared/components";
import { CrudDetailField, CrudRecordSection, CrudRecordWorkspace } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { PRESCRIPTION_GUIDANCE_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type PrescriptionViewSectionId = "overview" | "document" | "products";

type PrescriptionViewWorkspaceProps = {
  prescription: Prescription;
  canUpdate: boolean;
  canDelete: boolean;
  onBack: () => void;
  onDelete: () => void;
};

export function PrescriptionViewWorkspace({
  prescription,
  canUpdate,
  canDelete,
  onBack,
  onDelete,
}: PrescriptionViewWorkspaceProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const [activeSection, setActiveSection] = useState<PrescriptionViewSectionId>("products");
  const customerLabel = getPrescriptionCustomerLabel(prescription, t.notSet);
  const statusValue = prescription.status?.value;
  const products = prescription.products ?? [];

  const sectionItems: {
    id: PrescriptionViewSectionId;
    label: string;
    icon: typeof FileText;
  }[] = [
    { id: "overview", label: t.prescriptionOverviewSection, icon: UserRound },
    { id: "document", label: t.prescriptionDocumentSection, icon: FileText },
    { id: "products", label: t.prescriptionProductsSection, icon: Package },
  ];

  return (
    <CrudRecordWorkspace
      breadcrumbHref={ROUTES.admin.prescriptions}
      breadcrumbLabel={t.prescriptions}
      title={prescription.prescriptionNumber || customerLabel}
      subtitle={t.prescriptionViewHint}
      workspaceGuidance={PRESCRIPTION_GUIDANCE_ANCHORS.viewWorkspace}
      meta={
        <>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {t.idLabel}: {prescription.id}
          </span>
          <StatusBadge
            label={prescription.status?.label || prescription.status?.value || t.notSet}
            variant={getPrescriptionStatusVariant(statusValue)}
          />
        </>
      }
      onBack={onBack}
      backLabel={t.backToPrescriptions}
      headerActions={
        <>
          {canDelete ? (
            <AppButton type="button" variant="outline" onClick={onDelete}>
              <Trash2 className="size-4" aria-hidden="true" />
              {t.deleteAction}
            </AppButton>
          ) : null}
          {canUpdate ? (
            <AppButton type="button" asChild>
              <Link to={prescriptionEditPath(prescription)}>
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
      sectionsAriaLabel={t.prescriptionFormSections}
    >
      {activeSection === "overview" ? (
        <CrudRecordSection title={t.prescriptionOverviewSection} as="h2">
          <div className="grid gap-5 sm:grid-cols-2">
            <CrudDetailField label={t.prescriptionNumber}>
              <span className="font-mono font-semibold">
                {prescription.prescriptionNumber || t.notSet}
              </span>
            </CrudDetailField>
            <CrudDetailField label={t.customer}>
              <UserLabelText value={customerLabel} />
            </CrudDetailField>
            <CrudDetailField label={t.email}>
              {prescription.customer?.email || t.notSet}
            </CrudDetailField>
            <CrudDetailField label={t.phoneNumber}>
              {prescription.customer?.phoneNumber ? (
                <PhoneNumberText value={prescription.customer.phoneNumber} />
              ) : (
                t.notSet
              )}
            </CrudDetailField>
            <CrudDetailField label={t.date}>
              {prescription.createdAt
                ? formatDateTime(prescription.createdAt, language)
                : t.notSet}
            </CrudDetailField>
            <CrudDetailField label={t.prescriptionProductsCount}>
              {prescription.productsCount ?? products.length}
            </CrudDetailField>
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "document" ? (
        <CrudRecordSection
          title={t.prescriptionDocumentSection}
          description={t.prescriptionDocumentSectionHint}
          as="h2"
        >
          <PrescriptionDocumentPreview fileUrl={prescription.fileUrl} />
        </CrudRecordSection>
      ) : null}

      {activeSection === "products" ? (
        <CrudRecordSection
          title={t.prescriptionProductsSection}
          description={t.prescriptionProductsSectionHint}
          as="h2"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <CrudDetailField label={t.status}>
              <StatusBadge
                label={prescription.status?.label || prescription.status?.value || t.notSet}
                variant={getPrescriptionStatusVariant(statusValue)}
              />
            </CrudDetailField>
            <CrudDetailField label={t.pharmacistNote}>
              {prescription.notes?.trim() || t.notSet}
            </CrudDetailField>
          </div>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.prescriptionProductsEmptyHint}</p>
          ) : (
            <ul className="divide-y divide-border/60 rounded-xl border border-border/80">
              {products.map((product) => (
                <li key={product.id} className="flex items-center gap-3 px-4 py-3">
                  {product.imageFileUrl ? (
                    <MediaImage
                      src={product.imageFileUrl}
                      alt={product.title}
                      className="size-10 rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Package className="size-4" aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0 truncate text-sm font-medium text-foreground">
                    {product.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CrudRecordSection>
      ) : null}
    </CrudRecordWorkspace>
  );
}
