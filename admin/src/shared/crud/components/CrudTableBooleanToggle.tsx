import { CrudTableToggle } from "@/shared/crud/components/CrudTableToggle";

type CrudTableBooleanToggleProps<T extends { id: string | number }> = {
  entity: T;
  field: keyof T & string;
  checked: boolean;
  canUpdate: boolean;
  isLoading: boolean;
  ariaLabel: string;
  onToggle: (entity: T, field: keyof T & string, value: boolean) => void;
};

export function CrudTableBooleanToggle<T extends { id: string | number }>({
  entity,
  field,
  checked,
  canUpdate,
  isLoading,
  ariaLabel,
  onToggle,
}: CrudTableBooleanToggleProps<T>) {
  return (
    <CrudTableToggle
      checked={checked}
      disabled={!canUpdate}
      isLoading={isLoading}
      ariaLabel={ariaLabel}
      onCheckedChange={(value) => onToggle(entity, field, value)}
    />
  );
}
