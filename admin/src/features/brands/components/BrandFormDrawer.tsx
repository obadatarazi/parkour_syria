import { useState } from "react";

import { BrandForm } from "@/features/brands/components/BrandForm";
import { useBrandMutations } from "@/features/brands/hooks/use-brand-mutations";
import { brandsService } from "@/features/brands/services/brands.service";
import type { Brand } from "@/features/brands/types/brands.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type BrandFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  brand?: Brand | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function BrandFormDrawer({
  open,
  mode,
  brand,
  onOpenChange,
  onSuccess,
}: BrandFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useBrandMutations({
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

  const { data: brandDetail, isLoading: isBrandLoading } = useCrudQuery({
    queryKey: ["brands", "detail", String(brand?.id ?? "")],
    queryFn: () => brandsService.getById(brand!.id),
    enabled: open && mode === "edit" && Boolean(brand?.id),
  });

  const resolvedBrand = mode === "edit" ? (brandDetail ?? brand) : brand;

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
        title={mode === "create" ? t.addBrand : t.editBrand}
        size="lg"
        isLoading={isSaving}
        isFetching={mode === "edit" && isBrandLoading}
        fetchingLabel={t.loadingMessage}
      >
        <BrandForm
          mode={mode}
          brand={resolvedBrand}
          isLoading={isSaving || (mode === "edit" && isBrandLoading)}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            const result = await save(mode, data, resolvedBrand ?? undefined);
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
