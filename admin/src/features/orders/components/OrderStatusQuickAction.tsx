import { Check, ChevronDown } from "lucide-react";

import type { Order } from "@/features/orders/types/orders.types";
import { getOrderStatusVariant } from "@/features/orders/utils/order-status.utils";
import { StatusBadge, type StatusBadgeVariant } from "@/shared/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/design-system/components/ui/dropdown-menu";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type StatusOption = {
  value: string;
  label: string;
};

type OrderStatusQuickActionProps = {
  order: Order;
  canUpdate: boolean;
  statusOptions: StatusOption[];
  isStatusUpdating?: boolean;
  variant: StatusBadgeVariant;
  onChangeStatus: (order: Order, status: string) => void;
  /** Optional guidance selector for tours / hotspots */
  dataGuidance?: string;
  className?: string;
};

export function OrderStatusQuickAction({
  order,
  canUpdate,
  statusOptions,
  isStatusUpdating = false,
  variant,
  onChangeStatus,
  dataGuidance,
  className,
}: OrderStatusQuickActionProps) {
  const t = useTranslation();
  const currentStatus = order.status?.value ?? "";
  const label =
    statusOptions.find((option) => option.value === currentStatus)?.label ||
    order.status?.label ||
    order.status?.value ||
    t.notSet;

  if (!canUpdate) {
    return (
      <span data-guidance={dataGuidance} className={className}>
        <StatusBadge label={label} variant={variant} />
      </span>
    );
  }

  return (
    <div data-guidance={dataGuidance} className={cn("inline-flex", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={isStatusUpdating}
            aria-label={`${t.changeStatus}: ${label}`}
            className={cn(
              "group inline-flex items-center gap-1 rounded-full outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <StatusBadge
              label={label}
              variant={variant}
              className="max-w-[9rem] truncate transition-opacity group-hover:opacity-90"
            />
            <ChevronDown
              className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
              aria-hidden="true"
            />
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
                  <StatusBadge
                    label={option.label}
                    variant={getOrderStatusVariant(option.value)}
                  />
                  {isCurrent ? <Check className="ms-auto size-4 shrink-0" /> : null}
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
