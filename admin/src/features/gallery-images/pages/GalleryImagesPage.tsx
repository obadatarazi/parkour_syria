import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { GalleryImageFormDrawer } from "@/features/gallery-images/components/GalleryImageFormDrawer";
import { GalleryImageViewDialog } from "@/features/gallery-images/components/GalleryImageViewDialog";
import { useGalleryImageMutations } from "@/features/gallery-images/hooks/use-gallery-image-mutations";
import { useGalleryImagesList } from "@/features/gallery-images/hooks/use-gallery-images-list";
import { galleryImagesService } from "@/features/gallery-images/services/gallery-images.service";
import type { GalleryImage } from "@/features/gallery-images/types/gallery-images.types";
import { AppButton, BilingualText } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudBulkDeleteDialog,
  CrudDeleteDialog,
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  CrudTableBooleanToggle,
  useCrudBulkDelete,
  useCrudDialog,
  useCrudQuickToggle,
  useCrudRowActions,
  useCrudTableBulkActions,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { getBilingualField, pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

export function GalleryImagesPage() {
  const t = useTranslation();
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_GALLERY_IMAGE);
  const dialog = useCrudDialog<GalleryImage>();
  const list = useGalleryImagesList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => galleryImagesService.bulkDelete(ids),
    onSuccess: list.refetch,
  });
  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection: list.selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useGalleryImageMutations({
    onSuccess: async () => {
      dialog.close();
      await list.refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<GalleryImage>({
    patchItems: list.patchItems,
    toggle: quickToggle,
  });

  const rowActions = useCrudRowActions<GalleryImage>({ dialog, canUpdate, canDelete, t });

  const columns = useMemo(
    () => [
      {
        id: "caption",
        hideable: false,
        header: t.fieldCaption,
        cell: (galleryImage: GalleryImage) => (
          <CrudEntityNameCell
            imageUrl={galleryImage.imageFileUrl}
            placeholder="🖼️"
            size="md"
            onClick={() => dialog.openView(galleryImage)}
            actions={<CrudTableActions entity={galleryImage} actions={rowActions} ariaLabel={t.actions} />}
          >
            <BilingualText values={getBilingualField(galleryImage.translations, "caption", galleryImage.caption)} />
          </CrudEntityNameCell>
        ),
      },
      {
        id: "sortOrder",
        header: t.sortOrder,
        className: "w-24 text-center",
        headerClassName: "text-center",
        cell: (galleryImage: GalleryImage) => galleryImage.sortOrder,
      },
      {
        id: "publish",
        header: t.publish,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (galleryImage: GalleryImage) => (
          <CrudTableBooleanToggle
            entity={galleryImage}
            field="publish"
            checked={galleryImage.publish}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(galleryImage.id, "publish")}
            ariaLabel={`${t.publish}: ${pickLocaleText(galleryImage.translations, "caption", galleryImage.caption)}`}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, rowActions, t],
  );

  return (
    <CrudListPage
      title={t.navGallery}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addGalleryImage}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <CrudListTable
          tableId="gallery-images"
          onExportCsv={list.exportCsv}
          isExportingCsv={list.isExportingCsv}
          search={{ value: list.search, onChange: list.setSearch, onReset: list.resetSearch }}
          filters={{
            definitions: list.filterDefinitions,
            values: list.filters.values,
            onChange: list.filters.setFilter,
            onReset: list.filters.resetFilters,
            hasActiveFilters: list.filters.hasActiveFilters,
          }}
          sort={{ definitions: list.sortDefinitions, value: list.sort, onChange: list.setSort }}
          {...tableSelectionProps}
          columns={columns}
          data={list.items}
          isLoading={list.isLoading}
          isError={list.isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(list.error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void list.refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.navGallery}
          showingLabel={`${t.showing} ${list.items.length} ${t.of} ${list.total} ${t.results}`}
          pagination={{
            page: list.page,
            pageSize: list.pageSize,
            totalItems: list.total,
            onPageChange: list.setPage,
            onPageSizeChange: list.setPageSize,
            pageSizeLabel: t.perPage,
            previousLabel: t.previous,
            nextLabel: t.nextPage,
          }}
        />
      </CrudListSection>

      <GalleryImageViewDialog
        open={dialog.mode === "view"}
        galleryImage={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => !open && dialog.close()}
        onEdit={dialog.openEdit}
        onDelete={dialog.openDelete}
      />

      <GalleryImageFormDrawer
        open={dialog.mode === "create" || dialog.mode === "edit"}
        mode={dialog.mode === "edit" ? "edit" : "create"}
        galleryImage={dialog.entity}
        onOpenChange={(open) => !open && dialog.close()}
        onSuccess={list.refetch}
      />

      <CrudBulkDeleteDialog {...bulkDeleteDialogProps} />

      <CrudDeleteDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => !open && dialog.close()}
        entityLabel={dialog.entity ? pickLocaleText(dialog.entity.translations, "caption", dialog.entity.caption) : undefined}
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
