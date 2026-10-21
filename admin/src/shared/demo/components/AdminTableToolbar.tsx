import { Download, Filter, Plus } from "lucide-react";
import { type ReactNode } from "react";

import { AppButton, SearchField } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type AdminTableToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  extraButtons?: ReactNode;
};

export function AdminTableToolbar({
  search,
  onSearchChange,
  onAdd,
  addLabel,
  extraButtons,
}: AdminTableToolbarProps) {
  const t = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-5 py-4">
      <SearchField
        value={search}
        onChange={onSearchChange}
        placeholder={t.adminSearchPlaceholder}
        ariaLabel={t.adminSearchPlaceholder}
        className="w-52"
        inputClassName="h-8 text-xs"
      />
      <AppButton variant="outline" size="sm" className="h-8 text-xs">
        <Filter className="size-3.5" aria-hidden="true" />
        {t.filter}
      </AppButton>
      {extraButtons}
      <div className="ms-auto flex items-center gap-2">
        <AppButton variant="outline" size="sm" className="h-8 text-xs">
          <Download className="size-3.5" aria-hidden="true" />
          {t.exportCsv}
        </AppButton>
        {onAdd ? (
          <AppButton size="sm" className="h-8 text-xs shadow-sm" onClick={onAdd}>
            <Plus className="size-3.5" aria-hidden="true" />
            {addLabel ?? t.addNew}
          </AppButton>
        ) : null}
      </div>
    </div>
  );
}
