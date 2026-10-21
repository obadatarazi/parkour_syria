import { useState } from "react";

import { PaymentProviderForm } from "@/features/payment-providers/components/PaymentProviderForm";
import { usePaymentProviderMutations } from "@/features/payment-providers/hooks/use-payment-provider-mutations";
import { paymentProvidersService } from "@/features/payment-providers/services/payment-providers.service";
import type { PaymentProvider } from "@/features/payment-providers/types/payment-providers.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type PaymentProviderFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  paymentProvider?: PaymentProvider | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function PaymentProviderFormDrawer({
  open,
  mode,
  paymentProvider,
  onOpenChange,
  onSuccess,
}: PaymentProviderFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = usePaymentProviderMutations({
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

  const { data: providerDetail, isLoading: isProviderLoading } = useCrudQuery({
    queryKey: ["payment-providers", "detail", String(paymentProvider?.id ?? "")],
    queryFn: () => paymentProvidersService.getById(paymentProvider!.id),
    enabled: open && mode === "edit" && Boolean(paymentProvider?.id),
  });

  const resolvedProvider =
    mode === "edit" ? (providerDetail ?? paymentProvider) : paymentProvider;

  const requestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    onOpenChange(false);
  };

  return (
    <>
      <CrudEntityDrawer
        open={open}
        formMode={mode}
        onOpenChange={(next) => (next ? onOpenChange(next) : requestClose())}
        title={mode === "create" ? t.addPaymentProvider : t.editPaymentProvider}
        size="lg"
        isLoading={isSaving}
        isFetching={mode === "edit" && isProviderLoading}
        fetchingLabel={t.loadingMessage}
      >
        <PaymentProviderForm
          mode={mode}
          paymentProvider={resolvedProvider}
          isLoading={isSaving || (mode === "edit" && isProviderLoading)}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            const result = await save(mode, data, resolvedProvider ?? undefined);
            if (result === "skipped") {
              setIsDirty(false);
              onOpenChange(false);
            }
          }}
        />
      </CrudEntityDrawer>

      <ConfirmDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title={t.discardChangesTitle}
        description={t.discardChangesDescription}
        confirmLabel={t.discardChangesConfirm}
        cancelLabel={t.cancel}
        variant="destructive"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          setIsDirty(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
