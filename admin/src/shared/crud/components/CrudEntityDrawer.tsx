import { type ReactNode } from "react";

import { AppDrawer, type AppDrawerSize } from "@/shared/components";
import { useCreateFormTour } from "@/shared/guidance/hooks/use-create-form-tour";

import { CrudLoadingOverlay } from "./CrudLoadingOverlay";

type CrudEntityDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: AppDrawerSize;
  isLoading?: boolean;
  isFetching?: boolean;
  fetchingLabel?: string;
  scrollable?: boolean;
  /** When `"create"`, runs the page form guide tour once as the drawer opens. */
  formMode?: "create" | "edit";
};

export function CrudEntityDrawer({
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
  formMode,
}: CrudEntityDrawerProps) {
  const isBusy = isLoading || isFetching;
  useCreateFormTour(open, formMode);

  return (
    <AppDrawer
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
    </AppDrawer>
  );
}
