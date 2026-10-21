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
import { CRUD_FORM_DRAWER_ANCHORS } from "@/shared/guidance/constants/guidance.constants";

export type AppDrawerSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

const SIZE_CLASSES: Record<AppDrawerSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  "2xl": "sm:max-w-5xl",
  // Long-content editors (articles, pages, lessons): a full workspace with a fixed height.
  full: "sm:max-w-7xl sm:h-[calc(100dvh-2rem)]",
};

type AppDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: AppDrawerSize;
  isLoading?: boolean;
  scrollable?: boolean;
};

/**
 * The create / edit / view popup. A centered modal on desktop that takes the whole screen on
 * phones, so the page behind stays in place and the form gets the room it needs. The name is kept
 * from when this was a side panel, since every CRUD overlay goes through it.
 */
export function AppDrawer({
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
}: AppDrawerProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next && isLoading) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton
        data-guidance={CRUD_FORM_DRAWER_ANCHORS.panel}
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0 sm:max-h-[calc(100dvh-2rem)]",
          "max-sm:inset-0 max-sm:h-dvh max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0",
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
        <div
          className="shrink-0 border-b border-border/50 px-6 pt-5 pb-4"
          data-guidance={CRUD_FORM_DRAWER_ANCHORS.title}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <DialogTitle className="leading-snug">{title}</DialogTitle>
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
            data-guidance={CRUD_FORM_DRAWER_ANCHORS.body}
            className={cn(
              "min-h-0 flex-1 px-6 py-5",
              scrollable && "overflow-y-auto overscroll-contain",
            )}
          >
            {children}
          </div>
        ) : null}

        {footer ? (
          <div
            className="shrink-0 border-t border-border/50 px-6 py-4"
            data-guidance={CRUD_FORM_DRAWER_ANCHORS.footer}
          >
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end [&_button]:w-full sm:[&_button]:w-auto sm:[&_button]:min-w-[6.5rem]">
              {footer}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
