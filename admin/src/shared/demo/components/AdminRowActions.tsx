import { Edit, Eye, Trash2 } from "lucide-react";

import { AppButton } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type AdminRowActionsProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function AdminRowActions({ onView, onEdit, onDelete }: AdminRowActionsProps) {
  const t = useTranslation();

  return (
    <div className="flex items-center gap-1">
      {onView ? (
        <AppButton
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:bg-info-muted hover:text-info"
          onClick={onView}
          aria-label={t.viewAction}
        >
          <Eye className="size-3.5" aria-hidden="true" />
        </AppButton>
      ) : null}
      {onEdit ? (
        <AppButton
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:bg-warning-muted hover:text-warning"
          onClick={onEdit}
          aria-label={t.editAction}
        >
          <Edit className="size-3.5" aria-hidden="true" />
        </AppButton>
      ) : null}
      {onDelete ? (
        <AppButton
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={onDelete}
          aria-label={t.deleteAction}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </AppButton>
      ) : null}
    </div>
  );
}
