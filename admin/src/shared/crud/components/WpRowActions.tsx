import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

/**
 * WordPress-style under-title row actions: hidden until the table row
 * (or this cell) is hovered / focused.
 */
export function WpRowActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "transition-opacity duration-150 ease-out",
        "opacity-0 pointer-events-none",
        "group-hover/table-row:opacity-100 group-hover/table-row:pointer-events-auto",
        "group-focus-within/table-row:opacity-100 group-focus-within/table-row:pointer-events-auto",
        "group-hover/name:opacity-100 group-hover/name:pointer-events-auto",
        "group-focus-within/name:opacity-100 group-focus-within/name:pointer-events-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function WpRowActionSeparator() {
  return (
    <span className="text-muted-foreground/50" aria-hidden="true">
      |
    </span>
  );
}

export function WpRowActionButton({
  label,
  onClick,
  className,
  disabled,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "text-[11px] font-medium transition-colors hover:underline disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {label}
    </button>
  );
}
