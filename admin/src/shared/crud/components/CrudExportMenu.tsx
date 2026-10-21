import { Download } from "lucide-react";

import { AppButton } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CrudExportMenuProps = {
  onExportCsv?: () => void;
  disabled?: boolean;
  isExporting?: boolean;
};

export function CrudExportMenu({
  onExportCsv,
  disabled = false,
  isExporting = false,
}: CrudExportMenuProps) {
  const t = useTranslation();

  if (!onExportCsv) {
    return null;
  }

  return (
    <AppButton
      variant="outline"
      disabled={disabled || isExporting}
      isLoading={isExporting}
      loadingText={t.exportCsv}
      onClick={onExportCsv}
    >
      <Download className="size-4" />
      {t.exportCsv}
    </AppButton>
  );
}
