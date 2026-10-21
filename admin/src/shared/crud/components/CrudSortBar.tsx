import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import type { CrudSortDefinition } from "@/shared/crud/types/crud.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/design-system/components/ui/select";
import { cn } from "@/shared/design-system/components/ui/utils";

type CrudSortBarProps = {
  sorts: CrudSortDefinition[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function CrudSortBar({ sorts, value, onChange, className }: CrudSortBarProps) {
  if (sorts.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {sorts.map((sort) => (
        <div key={sort.id} className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{sort.label}</span>
          <Select value={value || CRUD_FILTER_ALL_VALUE} onValueChange={onChange}>
            <SelectTrigger className="h-8 w-[11rem] rounded-xl text-xs" size="sm" aria-label={sort.label}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sort.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
