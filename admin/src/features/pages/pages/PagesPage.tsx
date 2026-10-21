import { Pencil } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";

import { useCrudPermissions } from "@/features/auth";
import { PageFormDrawer } from "@/features/pages/components/PageFormDrawer";
import { usePageMutations } from "@/features/pages/hooks/use-page-mutations";
import { usePagesList } from "@/features/pages/hooks/use-pages-list";
import { pageKeyLabel, type SitePage } from "@/features/pages/types/pages.types";
import { BilingualText } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  type CrudRowAction,
  CrudTableActions,
  CrudTableBooleanToggle,
  useCrudDialog,
  useCrudQuickToggle,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { getBilingualField, pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

/** `?key=book` opens that page's editor, which is how the Book nav item lands on it. */
const OPEN_KEY_PARAM = "key";

export function PagesPage() {
  const t = useTranslation();
  const { canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_PAGE);
  const dialog = useCrudDialog<SitePage>();
  const list = usePagesList();
  const [searchParams, setSearchParams] = useSearchParams();

  const { quickToggle } = usePageMutations();
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<SitePage>({
    patchItems: list.patchItems,
    toggle: quickToggle,
  });

  const openKey = searchParams.get(OPEN_KEY_PARAM);
  useEffect(() => {
    if (!openKey || !canUpdate) return;
    const target = list.items.find((page) => page.key === openKey);
    if (!target) return;
    dialog.openEdit(target);
    const next = new URLSearchParams(searchParams);
    next.delete(OPEN_KEY_PARAM);
    setSearchParams(next, { replace: true });
  }, [canUpdate, dialog, list.items, openKey, searchParams, setSearchParams]);

  const rowActions = useMemo<CrudRowAction<SitePage>[]>(
    () =>
      canUpdate
        ? [{ id: "edit", label: t.editAction, icon: Pencil, onSelect: dialog.openEdit }]
        : [],
    [canUpdate, dialog.openEdit, t],
  );

  const columns = useMemo(
    () => [
      {
        id: "title",
        hideable: false,
        header: t.fieldTitle,
        cell: (page: SitePage) => (
          <CrudEntityNameCell
            imageUrl={page.imageFileUrl}
            placeholder="📄"
            onClick={canUpdate ? () => dialog.openEdit(page) : undefined}
            actions={<CrudTableActions entity={page} actions={rowActions} ariaLabel={t.actions} />}
          >
            <BilingualText values={getBilingualField(page.translations, "title", page.title)} />
          </CrudEntityNameCell>
        ),
      },
      {
        id: "key",
        header: t.pageKey,
        className: "w-44",
        cell: (page: SitePage) => (
          <div className="space-y-0.5">
            <p className="text-sm text-foreground">{pageKeyLabel(t, page.key)}</p>
            <p dir="ltr" className="font-mono text-xs text-muted-foreground">
              {page.key}
            </p>
          </div>
        ),
      },
      {
        id: "publish",
        header: t.publish,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (page: SitePage) => (
          <CrudTableBooleanToggle
            entity={page}
            field="publish"
            checked={page.publish}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(page.id, "publish")}
            ariaLabel={`${t.publish}: ${pickLocaleText(page.translations, "title", page.title)}`}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, rowActions, t],
  );

  return (
    <CrudListPage title={t.navPages}>
      <CrudListSection>
        <CrudListTable
          tableId="pages"
          onExportCsv={list.exportCsv}
          isExportingCsv={list.isExportingCsv}
          search={{ value: list.search, onChange: list.setSearch, onReset: list.resetSearch }}
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
          caption={t.navPages}
          showingLabel={`${t.showing} ${list.items.length} ${t.of} ${list.total} ${t.results}`}
        />
      </CrudListSection>

      <PageFormDrawer
        open={dialog.mode === "edit"}
        page={dialog.entity}
        onOpenChange={(open) => !open && dialog.close()}
        onSuccess={list.refetch}
      />
    </CrudListPage>
  );
}
