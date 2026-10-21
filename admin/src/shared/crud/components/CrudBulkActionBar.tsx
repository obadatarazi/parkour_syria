import { type ReactNode } from "react";

import { AppButton } from "@/shared/components/buttons/AppButton";
import { ActionBar } from "@/shared/components/layout/ActionBar";

type CrudBulkActionBarProps = {
  selectedCount: number;
  selectedLabel: string;
  clearLabel: string;
  onClear: () => void;
  actions?: ReactNode;
  className?: string;
};

export function CrudBulkActionBar({
  selectedCount,
  selectedLabel,
  clearLabel,
  onClear,
  actions,
  className,
}: CrudBulkActionBarProps) {
  if (selectedCount <= 0) return null;

  return (
    <ActionBar label={selectedLabel} className={className}>
      {actions}
      <AppButton variant="ghost" size="sm" onClick={onClear}>
        {clearLabel}
      </AppButton>
    </ActionBar>
  );
}
