import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { LessonFormDrawer } from "@/features/lessons/components/LessonFormDrawer";
import { LessonViewDialog } from "@/features/lessons/components/LessonViewDialog";
import { useLessonMutations } from "@/features/lessons/hooks/use-lesson-mutations";
import { useLessonsList } from "@/features/lessons/hooks/use-lessons-list";
import { lessonsService } from "@/features/lessons/services/lessons.service";
import type { Lesson } from "@/features/lessons/types/lessons.types";
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

export function LessonsPage() {
  const t = useTranslation();
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_LESSON);
  const dialog = useCrudDialog<Lesson>();
  const list = useLessonsList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => lessonsService.bulkDelete(ids),
    onSuccess: list.refetch,
  });
  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection: list.selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useLessonMutations({
    onSuccess: async () => {
      dialog.close();
      await list.refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<Lesson>({
    patchItems: list.patchItems,
    toggle: quickToggle,
  });

  const rowActions = useCrudRowActions<Lesson>({ dialog, canUpdate, canDelete, t });

  const columns = useMemo(
    () => [
      {
        id: "title",
        hideable: false,
        header: t.fieldTitle,
        cell: (lesson: Lesson) => (
          <CrudEntityNameCell
            imageUrl={lesson.imageFileUrl}
            placeholder="🎓"
            size="md"
            onClick={() => dialog.openView(lesson)}
            actions={<CrudTableActions entity={lesson} actions={rowActions} ariaLabel={t.actions} />}
          >
            <BilingualText values={getBilingualField(lesson.translations, "title", lesson.title)} />
          </CrudEntityNameCell>
        ),
      },
      {
        id: "youtube",
        header: t.fieldYoutubeUrl,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (lesson: Lesson) =>
          lesson.youtubeUrl ? (
            <a
              href={lesson.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-brand underline-offset-2 hover:underline"
            >
              {t.openLink}
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "sortOrder",
        header: t.sortOrder,
        className: "w-24 text-center",
        headerClassName: "text-center",
        cell: (lesson: Lesson) => lesson.sortOrder,
      },
      {
        id: "publish",
        header: t.publish,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (lesson: Lesson) => (
          <CrudTableBooleanToggle
            entity={lesson}
            field="publish"
            checked={lesson.publish}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(lesson.id, "publish")}
            ariaLabel={`${t.publish}: ${pickLocaleText(lesson.translations, "title", lesson.title)}`}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, rowActions, t],
  );

  return (
    <CrudListPage
      title={t.navLessons}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addLesson}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <CrudListTable
          tableId="lessons"
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
          caption={t.navLessons}
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

      <LessonViewDialog
        open={dialog.mode === "view"}
        lesson={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => !open && dialog.close()}
        onEdit={dialog.openEdit}
        onDelete={dialog.openDelete}
      />

      <LessonFormDrawer
        open={dialog.mode === "create" || dialog.mode === "edit"}
        mode={dialog.mode === "edit" ? "edit" : "create"}
        lesson={dialog.entity}
        onOpenChange={(open) => !open && dialog.close()}
        onSuccess={list.refetch}
      />

      <CrudBulkDeleteDialog {...bulkDeleteDialogProps} />

      <CrudDeleteDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => !open && dialog.close()}
        entityLabel={dialog.entity ? pickLocaleText(dialog.entity.translations, "title", dialog.entity.title) : undefined}
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
