import { AppButton } from "@/shared/components";
import { CrudFilterSelect } from "@/shared/crud/components/CrudFilterSelect";
import type { CrudFilterDefinition } from "@/shared/crud/types/crud.types";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CrudFilterBarProps = {
  filters: CrudFilterDefinition[];
  values: Record<string, string>;
  onChange: (filterId: string, value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  className?: string;
};

export function CrudFilterBar({
  filters,
  values,
  onChange,
  onReset,
  hasActiveFilters,
  className,
}: CrudFilterBarProps) {
  const t = useTranslation();

  if (filters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map((filter) => (
        <CrudFilterSelect
          key={filter.id}
          filter={filter}
          value={values[filter.id] ?? ""}
          onChange={(value) => onChange(filter.id, value)}
        />
      ))}
      {hasActiveFilters ? (
        <AppButton variant="ghost" size="sm" onClick={onReset}>
          {t.clearFilters}
        </AppButton>
      ) : null}
    </div>
  );
}
