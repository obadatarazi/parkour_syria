import { Eye, Pencil, Trash2 } from "lucide-react";
import { type ReactNode } from "react";

import { AppButton, AppDrawer, type AppDrawerSize } from "@/shared/components";

export type CrudViewDialogSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type CrudViewDialogProps<TEntity> = {
  open: boolean;
  entity: TEntity | null;
  onOpenChange: (open: boolean) => void;
  title: string;
  size?: AppDrawerSize;
  /** Hero block rendered inside a highlighted card (image, title, badges, etc). */
  hero: ReactNode;
  /** Detail sections rendered below the hero (e.g. bilingual content, metadata). */
  sections?: CrudViewDialogSection[];
  cancelLabel: string;
  canUpdate?: boolean;
  canDelete?: boolean;
  editLabel?: string;
  deleteLabel?: string;
  onEdit?: (entity: TEntity) => void;
  onDelete?: (entity: TEntity) => void;
  /** Extra footer actions rendered before cancel / edit / delete. */
  footerActions?: ReactNode;
};

/**
 * Standard read-only "view" side panel for a CRUD list row. Uses the same
 * drawer pattern as create/edit flows for a more consistent table UX.
 */
export function CrudViewDialog<TEntity>({
  open,
  entity,
  onOpenChange,
  title,
  size = "lg",
  hero,
  sections = [],
  cancelLabel,
  canUpdate = false,
  canDelete = false,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  footerActions,
}: CrudViewDialogProps<TEntity>) {
  if (!entity) return null;

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size={size}
      scrollable
      footer={
        <>
          <AppButton variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </AppButton>
          {footerActions}
          {canDelete && onDelete ? (
            <AppButton variant="destructive" onClick={() => onDelete(entity)}>
              <Trash2 className="size-4" aria-hidden="true" />
              {deleteLabel}
            </AppButton>
          ) : null}
          {canUpdate && onEdit ? (
            <AppButton onClick={() => onEdit(entity)}>
              <Pencil className="size-4" aria-hidden="true" />
              {editLabel}
            </AppButton>
          ) : null}
        </>
      }
    >
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-muted/20 p-4 shadow-xs sm:p-5">
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/8 via-transparent to-transparent"
            aria-hidden="true"
          />
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Eye className="size-3.5" aria-hidden="true" />
              <span>Details</span>
            </div>
            {hero}
          </div>
        </div>

        {sections.length > 0 ? (
          <div className="space-y-4">
            {sections.map((section) => (
              <section
                key={section.id}
                className="rounded-xl border border-border/70 bg-card/70 p-4 shadow-xs sm:p-5"
              >
                <h3 className="mb-4 border-b border-border/60 pb-3 text-sm font-semibold text-foreground">
                  {section.title}
                </h3>
                {section.content}
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </AppDrawer>
  );
}
