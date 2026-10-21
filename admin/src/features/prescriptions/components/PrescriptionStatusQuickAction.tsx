import { ChevronDown } from "lucide-react";

import type { Prescription } from "@/features/prescriptions/types/prescriptions.types";
import { StatusBadge, type StatusBadgeVariant } from "@/shared/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/design-system/components/ui/dropdown-menu";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type StatusOption = {
  value: string;
  label: string;
};

type PrescriptionStatusQuickActionProps = {
  prescription: Prescription;
  canUpdate: boolean;
  statusOptions: StatusOption[];
  isStatusUpdating?: boolean;
  variant: StatusBadgeVariant;
  onChangeStatus: (prescription: Prescription, status: string) => void;
  dataGuidance?: string;
  className?: string;
};

export function PrescriptionStatusQuickAction({
  prescription,
  canUpdate,
  statusOptions,
  isStatusUpdating = false,
  variant,
  onChangeStatus,
  dataGuidance,
  className,
}: PrescriptionStatusQuickActionProps) {
  const t = useTranslation();
  const currentStatus = prescription.status?.value ?? "";
  const label =
    statusOptions.find((option) => option.value === currentStatus)?.label ||
    prescription.status?.label ||
    prescription.status?.value ||
    t.notSet;

  if (!canUpdate) {
    return (
      <span data-guidance={dataGuidance} className={className}>
        <StatusBadge label={label} variant={variant} />
      </span>
    );
  }

  return (
    <div data-guidance={dataGuidance} className={cn("inline-flex", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={isStatusUpdating}
            aria-label={`${t.status}: ${label}`}
            className={cn(
              "group inline-flex items-center gap-1 rounded-full outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <StatusBadge
              label={label}
              variant={variant}
              className="max-w-[9rem] truncate transition-opacity group-hover:opacity-90"
            />
            <ChevronDown
              className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
              aria-hidden="true"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" onClick={(event) => event.stopPropagation()}>
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              disabled={option.value === currentStatus || isStatusUpdating}
              onSelect={() => onChangeStatus(prescription, option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
