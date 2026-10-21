import { useState } from "react";

import { TrendingSearchForm } from "@/features/trending-searches/components/TrendingSearchForm";
import { useTrendingSearchMutations } from "@/features/trending-searches/hooks/use-trending-search-mutations";
import { trendingSearchesService } from "@/features/trending-searches/services/trending-searches.service";
import type { TrendingSearch } from "@/features/trending-searches/types/trending-searches.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type TrendingSearchFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  item?: TrendingSearch | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function TrendingSearchFormDrawer({
  open,
  mode,
  item,
  onOpenChange,
  onSuccess,
}: TrendingSearchFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useTrendingSearchMutations({
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

  const { data: itemDetail, isLoading: isItemLoading } = useCrudQuery({
    queryKey: ["trending-searches", "detail", String(item?.id ?? "")],
    queryFn: () => trendingSearchesService.getById(item!.id),
    enabled: open && mode === "edit" && Boolean(item?.id),
  });

  const resolvedItem = mode === "edit" ? (itemDetail ?? item) : item;

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
        title={mode === "create" ? t.addTrendingSearch : t.editTrendingSearch}
        size="lg"
        isLoading={isSaving}
        isFetching={mode === "edit" && isItemLoading}
        fetchingLabel={t.loadingMessage}
      >
        <TrendingSearchForm
          mode={mode}
          item={resolvedItem}
          isLoading={isSaving || (mode === "edit" && isItemLoading)}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            const result = await save(mode, data, resolvedItem ?? undefined);
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
