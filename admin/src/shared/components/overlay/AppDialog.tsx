import { X } from "lucide-react";
import { type ReactNode } from "react";

import {
  handleOverlayEscape,
  preventOverlayDismiss,
} from "@/shared/components/overlay/overlay-dismiss.utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/design-system/components/ui/dialog";
import { cn } from "@/shared/design-system/components/ui/utils";

export type AppDialogSize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<AppDialogSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

type AppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: AppDialogSize;
  isLoading?: boolean;
  scrollable?: boolean;
};

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  size = "md",
  isLoading = false,
  scrollable = true,
}: AppDialogProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next && isLoading) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton
        className={cn(
          "flex max-h-[min(90vh,52rem)] flex-col gap-0 overflow-hidden p-0",
          SIZE_CLASSES[size],
          className,
        )}
        aria-busy={isLoading}
        onInteractOutside={preventOverlayDismiss(isLoading)}
        onPointerDownOutside={preventOverlayDismiss(isLoading)}
        onFocusOutside={preventOverlayDismiss(isLoading)}
        onEscapeKeyDown={handleOverlayEscape(isLoading)}
        {...(description ? {} : { "aria-describedby": undefined })}
      >
        <div className="shrink-0 border-b border-border/50 px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <DialogTitle>{title}</DialogTitle>
              {description ? <DialogDescription>{description}</DialogDescription> : null}
            </div>
            <DialogClose
              disabled={isLoading}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden disabled:pointer-events-none"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden="true" />
            </DialogClose>
          </div>
        </div>

        {children ? (
          <div
            className={cn(
              "min-h-0 flex-1 px-6 py-5",
              scrollable && "overflow-y-auto overscroll-contain",
            )}
          >
            {children}
          </div>
        ) : null}

        {footer ? (
          <div className="shrink-0 border-t border-border/50 px-6 py-4">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end [&_button]:w-full sm:[&_button]:w-auto sm:[&_button]:min-w-[6.5rem]">
              {footer}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
