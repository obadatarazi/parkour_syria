import { type ReactNode } from "react";

import { AppDialog, type AppDialogSize } from "@/shared/components";

import { CrudLoadingOverlay } from "./CrudLoadingOverlay";

type CrudEntityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: AppDialogSize;
  isLoading?: boolean;
  isFetching?: boolean;
  fetchingLabel?: string;
  scrollable?: boolean;
};

export function CrudEntityDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "lg",
  isLoading = false,
  isFetching = false,
  fetchingLabel,
  scrollable = true,
}: CrudEntityDialogProps) {
  const isBusy = isLoading || isFetching;

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={footer}
      size={size}
      isLoading={isBusy}
      scrollable={scrollable}
    >
      <CrudLoadingOverlay isLoading={isFetching} label={fetchingLabel} className="min-h-[8rem]">
        {children}
      </CrudLoadingOverlay>
    </AppDialog>
  );
}
