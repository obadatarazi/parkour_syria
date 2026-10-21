import { FileText, Package } from "lucide-react";
import type { ReactNode } from "react";

import type { Prescription } from "@/features/prescriptions/types/prescriptions.types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/design-system/components/ui/tooltip";
import { cn } from "@/shared/design-system/components/ui/utils";

type PrescriptionQuickActionButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function PrescriptionQuickActionButton({
  label,
  disabled = false,
  onClick,
  children,
}: PrescriptionQuickActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-brand transition-opacity",
              "hover:bg-muted/60 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {children}
          </button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

type PrescriptionQuickActionsProps = {
  prescription: Prescription;
  canUpdate: boolean;
  viewFileLabel: string;
  addProductsLabel: string;
  onViewFile: (prescription: Prescription) => void;
  onAddProducts: (prescription: Prescription) => void;
  className?: string;
};

export function PrescriptionQuickActions({
  prescription,
  canUpdate,
  viewFileLabel,
  addProductsLabel,
  onViewFile,
  onAddProducts,
  className,
}: PrescriptionQuickActionsProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <PrescriptionQuickActionButton
        label={viewFileLabel}
        disabled={!prescription.fileUrl}
        onClick={() => onViewFile(prescription)}
      >
        <FileText className="size-4" aria-hidden="true" />
      </PrescriptionQuickActionButton>
      {canUpdate ? (
        <PrescriptionQuickActionButton
          label={addProductsLabel}
          onClick={() => onAddProducts(prescription)}
        >
          <Package className="size-4" aria-hidden="true" />
        </PrescriptionQuickActionButton>
      ) : null}
    </div>
  );
}
