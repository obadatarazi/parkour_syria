import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import type { CrudFilterDefinition } from "@/shared/crud/types/crud.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/design-system/components/ui/select";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CrudFilterSelectProps = {
  filter: CrudFilterDefinition;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  className?: string;
};

export function CrudFilterSelect({
  filter,
  value,
  onChange,
  compact = false,
  className,
}: CrudFilterSelectProps) {
  const t = useTranslation();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="shrink-0 text-xs font-medium text-muted-foreground">{filter.label}</span>
      <Select
        value={value && value !== CRUD_FILTER_ALL_VALUE ? value : CRUD_FILTER_ALL_VALUE}
        onValueChange={onChange}
      >
        <SelectTrigger
          className={cn(compact ? "h-8 w-[9.5rem] rounded-xl text-xs" : "h-8 w-[10rem]")}
          size="sm"
          aria-label={filter.label}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={CRUD_FILTER_ALL_VALUE}>{filter.allLabel ?? t.filterAll}</SelectItem>
          {filter.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
