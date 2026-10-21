import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/design-system/components/ui/tooltip";
import { cn } from "@/shared/design-system/components/ui/utils";

type OrderDocumentIconButtonProps = {
  label: string;
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function OrderDocumentIconButton({
  label,
  disabled,
  isLoading,
  onClick,
  children,
}: OrderDocumentIconButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <button
            type="button"
            aria-label={label}
            disabled={isDisabled}
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-opacity",
              "hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin text-brand" aria-hidden="true" />
            ) : (
              children
            )}
          </button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

/** Invoice PDF icon — document with receipt mark, brand + destructive tokens. */
function InvoiceDocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7 text-brand", className)}
      aria-hidden="true"
      fill="none"
    >
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 7.5h10.2L23 11.3V24.5H9V7.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M19.2 7.5V11.3H23"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="6" y="5" width="8" height="3.5" rx="0.5" className="fill-destructive" />
      <path
        d="M12 15.5h8M12 18.5h8M12 21.5h5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Packing slip PDF icon — document with text lines, brand + destructive tokens. */
function PackingSlipDocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7 text-brand", className)}
      aria-hidden="true"
      fill="none"
    >
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 7.5h10.2L23 11.3V24.5H9V7.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M19.2 7.5V11.3H23"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="6" y="5" width="8" height="3.5" rx="0.5" className="fill-destructive" />
      <path
        d="M12 15.5h8M12 18.5h8M12 21.5h5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type OrderDocumentActionsProps = {
  canDownloadInvoice?: boolean;
  canDownloadPackingSlip?: boolean;
  hasInvoiceNumber?: boolean;
  hasOrderRefNumber?: boolean;
  isInvoiceDownloading?: boolean;
  isPackingSlipDownloading?: boolean;
  /** Disables both icons (e.g. another row is downloading). */
  isBusy?: boolean;
  invoiceLabel: string;
  packingSlipLabel: string;
  onDownloadInvoice: () => void;
  onDownloadPackingSlip: () => void;
  className?: string;
};

/**
 * Always-visible PDF action icons for an order table row.
 */
export function OrderDocumentActions({
  canDownloadInvoice = false,
  canDownloadPackingSlip = false,
  hasInvoiceNumber = false,
  hasOrderRefNumber = false,
  isInvoiceDownloading = false,
  isPackingSlipDownloading = false,
  isBusy = false,
  invoiceLabel,
  packingSlipLabel,
  onDownloadInvoice,
  onDownloadPackingSlip,
  className,
}: OrderDocumentActionsProps) {
  if (!canDownloadInvoice && !canDownloadPackingSlip) return null;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {canDownloadInvoice ? (
        <OrderDocumentIconButton
          label={invoiceLabel}
          disabled={!hasInvoiceNumber || isBusy || isPackingSlipDownloading}
          isLoading={isInvoiceDownloading}
          onClick={onDownloadInvoice}
        >
          <InvoiceDocumentIcon />
        </OrderDocumentIconButton>
      ) : null}

      {canDownloadPackingSlip ? (
        <OrderDocumentIconButton
          label={packingSlipLabel}
          disabled={!hasOrderRefNumber || isBusy || isInvoiceDownloading}
          isLoading={isPackingSlipDownloading}
          onClick={onDownloadPackingSlip}
        >
          <PackingSlipDocumentIcon />
        </OrderDocumentIconButton>
      ) : null}
    </div>
  );
}
