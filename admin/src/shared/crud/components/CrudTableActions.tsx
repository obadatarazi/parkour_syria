import { Fragment } from "react";

import {
  WpRowActionButton,
  WpRowActions,
  WpRowActionSeparator,
} from "@/shared/crud/components/WpRowActions";
import type { CrudRowAction } from "@/shared/crud/types/crud.types";
import { cn } from "@/shared/design-system/components/ui/utils";

type CrudTableActionsProps<TEntity> = {
  entity: TEntity;
  actions: CrudRowAction<TEntity>[];
  ariaLabel: string;
  className?: string;
};

/**
 * WordPress-style row actions: View | Edit | Delete on a single row,
 * revealed on row hover / focus.
 */
export function CrudTableActions<TEntity>({
  entity,
  actions,
  ariaLabel,
  className,
}: CrudTableActionsProps<TEntity>) {
  const visibleActions = actions.filter((action) => !action.hidden);

  if (visibleActions.length === 0) return null;

  return (
    <WpRowActions className={className}>
      <div
        className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-5"
        role="group"
        aria-label={ariaLabel}
      >
        {visibleActions.map((action, index) => (
          <Fragment key={action.id}>
            {index > 0 ? <WpRowActionSeparator /> : null}
            <WpRowActionButton
              label={action.label}
              disabled={action.disabled}
              className={cn(
                action.variant === "destructive" ? "text-destructive" : "text-brand",
              )}
              onClick={() => {
                if (action.disabled) return;
                action.onSelect(entity);
              }}
            />
          </Fragment>
        ))}
      </div>
    </WpRowActions>
  );
}
