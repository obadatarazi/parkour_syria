import { PrescriptionDocumentPreview } from "@/features/prescriptions/components/PrescriptionDocumentPreview";
import type { Prescription } from "@/features/prescriptions/types/prescriptions.types";
import { getPrescriptionCustomerLabel } from "@/features/prescriptions/types/prescriptions.types";
import { AppDrawer } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type PrescriptionFileViewDialogProps = {
  prescription: Prescription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PrescriptionFileViewDialog({
  prescription,
  open,
  onOpenChange,
}: PrescriptionFileViewDialogProps) {
  const t = useTranslation();

  if (!prescription) return null;

  const title =
    prescription.prescriptionNumber ||
    getPrescriptionCustomerLabel(prescription, t.viewPrescription);

  return (
    <AppDrawer open={open} onOpenChange={onOpenChange} title={title} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t.prescriptionDocumentSectionHint}</p>
        <PrescriptionDocumentPreview fileUrl={prescription.fileUrl} />
      </div>
    </AppDrawer>
  );
}
