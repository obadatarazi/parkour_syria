import { ConfirmDialog } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CrudDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
};

export function CrudDeleteDialog({
  open,
  onOpenChange,
  entityLabel,
  onConfirm,
  isLoading = false,
  title,
  description,
  confirmLabel,
}: CrudDeleteDialogProps) {
  const t = useTranslation();

  const resolvedTitle =
    title ?? (entityLabel ? `${t.delete} ${entityLabel}` : t.crudDeleteTitle);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={resolvedTitle}
      description={description ?? t.crudDeleteConfirmDescription}
      confirmLabel={confirmLabel ?? t.delete}
      cancelLabel={t.cancel}
      onConfirm={onConfirm}
      isLoading={isLoading}
      variant="destructive"
    />
  );
}
