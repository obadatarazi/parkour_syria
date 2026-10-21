import { type ReactNode } from "react";

import { EntityMediaThumbnail } from "@/shared/components/data/EntityImagePlaceholder";
import { cn } from "@/shared/design-system/components/ui/utils";

type CrudEntityNameCellProps = {
  imageUrl?: string | null;
  imageAlt?: string;
  /**
   * Shown instead of the image when there is none or the image fails to load.
   * Pass a framed placeholder component (e.g. `CategoryImagePlaceholder`) or a simple emoji.
   */
  placeholder?: ReactNode;
  /** Opens the entity's view dialog when provided; renders static text otherwise. */
  onClick?: () => void;
  children: ReactNode;
  /** `sm` (size-8) is the default for dense list tables; `md` (size-10) for larger media. */
  size?: "sm" | "md";
  /**
   * WordPress-style secondary actions under the title (Edit | Delete | …).
   * Revealed on row hover via `WpRowActions` / `group/table-row`.
   */
  actions?: ReactNode;
};

/**
 * Standard "name" column cell used across CRUD tables: an image thumbnail
 * (or placeholder) next to a clickable title that opens the row's view
 * dialog, matching the Categories/Brands table pattern.
 */
export function CrudEntityNameCell({
  imageUrl,
  imageAlt = "",
  placeholder,
  onClick,
  children,
  size = "sm",
  actions,
}: CrudEntityNameCellProps) {
  const dimensionClass = size === "sm" ? "size-8" : "size-10";
  const useEmojiFrame = typeof placeholder === "string" || typeof placeholder === "number";

  const resolvedPlaceholder = !placeholder
    ? null
    : useEmojiFrame
      ? (
          <span
            className={cn(
              dimensionClass,
              "flex shrink-0 items-center justify-center rounded-lg bg-muted text-sm",
            )}
            aria-hidden="true"
          >
            {placeholder}
          </span>
        )
      : (
          placeholder
        );

  return (
    <div className="group/name flex items-center gap-2.5">
      {imageUrl || resolvedPlaceholder ? (
        <EntityMediaThumbnail
          imageUrl={imageUrl}
          imageAlt={imageAlt}
          size={size}
          placeholder={resolvedPlaceholder}
        />
      ) : null}
      <div className="min-w-0 space-y-0.5">
        {onClick ? (
          <button
            type="button"
            className="min-w-0 text-start text-xs font-semibold text-brand transition-colors hover:underline"
            onClick={onClick}
          >
            {children}
          </button>
        ) : (
          <div className="min-w-0 text-xs">{children}</div>
        )}
        {actions}
      </div>
    </div>
  );
}
