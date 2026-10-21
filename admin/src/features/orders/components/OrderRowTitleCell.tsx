import { Check } from "lucide-react";

import type { Order } from "@/features/orders/types/orders.types";
import {
  WpRowActionButton,
  WpRowActions,
  WpRowActionSeparator,
} from "@/shared/crud/components/WpRowActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/design-system/components/ui/dropdown-menu";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type StatusOption = {
  value: string;
  label: string;
};

type OrderRowTitleCellProps = {
  order: Order;
  canUpdate: boolean;
  statusOptions: StatusOption[];
  isStatusUpdating?: boolean;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onChangeStatus: (order: Order, status: string) => void;
};

/**
 * WordPress-style order number cell: click title to view; Edit | Change status on row hover.
 */
export function OrderRowTitleCell({
  order,
  canUpdate,
  statusOptions,
  isStatusUpdating = false,
  onView,
  onEdit,
  onChangeStatus,
}: OrderRowTitleCellProps) {
  const t = useTranslation();
  const currentStatus = order.status?.value ?? "";

  return (
    <div className="group/name min-w-0 space-y-0.5">
      <button
        type="button"
        className="max-w-full truncate font-mono text-xs font-bold text-brand transition-colors hover:underline"
        title={order.orderRefNumber}
        onClick={() => onView(order)}
      >
        {order.orderRefNumber}
      </button>

      {canUpdate ? (
        <WpRowActions>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-5">
            <WpRowActionButton
              label={t.editAction}
              className="text-brand"
              onClick={() => onEdit(order)}
            />
            <WpRowActionSeparator />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={isStatusUpdating}
                  onClick={(event) => event.stopPropagation()}
                  className="text-xs font-medium text-brand transition-colors hover:underline disabled:pointer-events-none disabled:opacity-50"
                >
                  {t.changeStatus}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                {statusOptions.length === 0 ? (
                  <DropdownMenuItem disabled>{t.loadingMessage}</DropdownMenuItem>
                ) : (
                  statusOptions.map((option) => {
                    const isCurrent = option.value === currentStatus;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        disabled={isCurrent || isStatusUpdating}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (isCurrent) return;
                          onChangeStatus(order, option.value);
                        }}
                      >
                        <span className="flex-1">{option.label}</span>
                        {isCurrent ? <Check className="size-4 shrink-0" /> : null}
                      </DropdownMenuItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </WpRowActions>
      ) : null}
    </div>
  );
}
