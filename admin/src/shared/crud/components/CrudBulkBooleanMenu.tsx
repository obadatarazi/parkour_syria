import { Check, ChevronDown, X } from "lucide-react";

import { AppButton } from "@/shared/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/design-system/components/ui/dropdown-menu";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export type CrudBulkBooleanField = {
  field: string;
  label: string;
  enableLabel?: string;
  disableLabel?: string;
};

type CrudBulkBooleanMenuProps = {
  fields: CrudBulkBooleanField[];
  onUpdate: (field: string, value: boolean) => void | Promise<void>;
  disabled?: boolean;
};

export function CrudBulkBooleanMenu({
  fields,
  onUpdate,
  disabled = false,
}: CrudBulkBooleanMenuProps) {
  const t = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AppButton variant="default" size="sm" disabled={disabled}>
          {t.bulkUpdate}
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </AppButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {fields.map((fieldConfig, index) => {
          const enableLabel =
            fieldConfig.enableLabel ?? t.bulkMarkAs.replace("{field}", fieldConfig.label);
          const disableLabel =
            fieldConfig.disableLabel ?? t.bulkRemove.replace("{field}", fieldConfig.label);

          return (
            <div key={fieldConfig.field}>
              {index > 0 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {fieldConfig.label}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => void onUpdate(fieldConfig.field, true)}>
                <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
                {enableLabel}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void onUpdate(fieldConfig.field, false)}>
                <X className="size-3.5 text-muted-foreground" aria-hidden="true" />
                {disableLabel}
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
