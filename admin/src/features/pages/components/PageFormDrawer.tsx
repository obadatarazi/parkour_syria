import { PageForm } from "@/features/pages/components/PageForm";
import { usePageMutations } from "@/features/pages/hooks/use-page-mutations";
import { pageKeyLabel, type SitePage } from "@/features/pages/types/pages.types";
import { CrudDirtyFormDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type PageFormDrawerProps = {
  open: boolean;
  page: SitePage | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function PageFormDrawer({ open, page, onOpenChange, onSuccess }: PageFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = usePageMutations({ onSuccess });

  return (
    <CrudDirtyFormDrawer
      open={open && Boolean(page)}
      mode="edit"
      title={page ? `${t.editPage} · ${pageKeyLabel(t, page.key)}` : t.editPage}
      size="2xl"
      isLoading={isSaving}
      onOpenChange={onOpenChange}
    >
      {({ onDirtyChange, requestClose, closeClean }) =>
        page ? (
          <PageForm
            page={page}
            isLoading={isSaving}
            onCancel={requestClose}
            onDirtyChange={onDirtyChange}
            onSubmit={async (data) => {
              const result = await save("edit", data, page);
              if (result) closeClean();
            }}
          />
        ) : null
      }
    </CrudDirtyFormDrawer>
  );
}
