import { Loader2, Trash2 } from "lucide-react";
import { type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/shared/design-system/components/ui/alert-dialog";
import { Button } from "@/shared/design-system/components/ui/button";
import { cn } from "@/shared/design-system/components/ui/utils";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  variant?: "default" | "destructive";
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isLoading = false,
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="gap-0 sm:max-w-lg"
        {...(description ? {} : { "aria-describedby": undefined })}
      >
        {variant === "destructive" ? (
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-50">
            <Trash2 className="size-6 text-rose-500" aria-hidden="true" />
          </div>
        ) : null}

        <AlertDialogTitle className="mb-1">{title}</AlertDialogTitle>
        {description ? (
          <AlertDialogDescription asChild>
            <div className="mb-5 text-sm text-muted-foreground">{description}</div>
          </AlertDialogDescription>
        ) : null}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            className={cn("flex-1", isLoading && "gap-2")}
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {confirmLabel}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
