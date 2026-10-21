import { AppButton, FormActions } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";

type CrudFormFooterProps = {
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  isLoading?: boolean;
  loadingLabel?: string;
  submitDisabled?: boolean;
  sticky?: boolean;
  dataGuidance?: string;
};

export function CrudFormFooter({
  submitLabel,
  cancelLabel,
  onCancel,
  isLoading = false,
  loadingLabel,
  submitDisabled = false,
  sticky = true,
  dataGuidance = "crud-form-actions",
}: CrudFormFooterProps) {
  return (
    <FormActions
      data-guidance={dataGuidance}
      className={cn(
        "gap-3 sm:flex-row sm:flex-nowrap sm:justify-end",
        sticky
          ? "pointer-events-none sticky bottom-0 z-20 mt-6 border-t border-border/50 bg-card py-4 shadow-[0_-8px_16px_-12px_rgba(0,0,0,0.25)] [&_button]:pointer-events-auto [&_button]:w-full sm:[&_button]:w-auto sm:[&_button]:min-w-[6.5rem]"
          : "mt-5 [&_button]:w-full sm:[&_button]:w-auto sm:[&_button]:min-w-[6.5rem]",
      )}
    >
      <AppButton type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
        {cancelLabel}
      </AppButton>
      <AppButton
        type="submit"
        isLoading={isLoading}
        loadingText={loadingLabel}
        disabled={submitDisabled}
      >
        {submitLabel}
      </AppButton>
    </FormActions>
  );
}
