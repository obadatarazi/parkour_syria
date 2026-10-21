import { GripVertical, RotateCcw } from "lucide-react";
import {
  Children,
  type ComponentPropsWithoutRef,
  createContext,
  Fragment,
  isValidElement,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AppButton } from "@/shared/components/buttons/AppButton";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { usePersistedOrder } from "@/shared/hooks/use-persisted-order";

const gridClassMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
} as const;

type SortableWidgetContextValue = {
  layoutId: string;
  columns?: 1 | 2 | 3 | 4 | 5;
  draggingId: string | null;
  overId: string | null;
  setDraggingId: (id: string | null) => void;
  setOverId: (id: string | null) => void;
  moveTo: (fromId: string, toId: string) => void;
  moveByOffset: (id: string, delta: number) => void;
  announceMove: (position: number, total: number, label?: string) => void;
  order: string[];
};

const SortableWidgetContext = createContext<SortableWidgetContextValue | null>(null);

function useSortableWidgetContext() {
  const context = useContext(SortableWidgetContext);
  if (!context) {
    throw new Error("SortableWidget must be used within SortableWidgetLayout");
  }
  return context;
}

function widgetIdFromPoint(x: number, y: number, layoutId: string): string | null {
  let node = document.elementFromPoint(x, y);

  while (node instanceof Element) {
    const host = node.closest("[data-sortable-widget-id]");
    if (!host) return null;
    if (host.getAttribute("data-sortable-layout-id") === layoutId) {
      return host.getAttribute("data-sortable-widget-id");
    }
    node = host.parentElement;
  }

  return null;
}

export type SortableWidgetProps = {
  id: string;
  /** Accessible name used by the drag handle and move announcements. */
  label?: string;
  className?: string;
  children: ReactNode;
};

export function SortableWidget({ id, label, className, children }: SortableWidgetProps) {
  const t = useTranslation();
  const { direction } = useLocalization();
  const {
    layoutId,
    columns,
    draggingId,
    overId,
    setDraggingId,
    setOverId,
    moveTo,
    moveByOffset,
    announceMove,
    order,
  } = useSortableWidgetContext();

  const isDragging = draggingId === id;
  const isDropTarget = overId === id && draggingId != null && draggingId !== id;
  const handleLabel = label ? t.widgetReorderNamed.replace("{title}", label) : t.widgetReorder;

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDraggingId(id);
      setOverId(id);
    },
    [id, setDraggingId, setOverId],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();

      const nextOverId = widgetIdFromPoint(event.clientX, event.clientY, layoutId);
      setOverId(nextOverId);
    },
    [layoutId, setOverId],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      const dropId = widgetIdFromPoint(event.clientX, event.clientY, layoutId) ?? overId;
      if (event.type === "pointerup" && dropId && dropId !== id) {
        const dropIndex = order.indexOf(dropId);
        moveTo(id, dropId);
        if (dropIndex >= 0) {
          announceMove(dropIndex + 1, order.length, label);
        }
      }

      setDraggingId(null);
      setOverId(null);
    },
    [announceMove, id, label, layoutId, moveTo, order, overId, setDraggingId, setOverId],
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      const step = columns ?? 1;
      const visualDelta =
        event.key === "ArrowLeft"
          ? -1
          : event.key === "ArrowRight"
            ? 1
            : event.key === "ArrowUp"
              ? -step
              : event.key === "ArrowDown"
                ? step
                : 0;

      if (event.key === "Home") {
        event.preventDefault();
        moveTo(id, order[0] ?? id);
        announceMove(1, order.length, label);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        moveTo(id, order[order.length - 1] ?? id);
        announceMove(order.length, order.length, label);
        return;
      }

      if (visualDelta === 0) return;

      event.preventDefault();
      const delta =
        (event.key === "ArrowLeft" || event.key === "ArrowRight") && direction === "rtl"
          ? -visualDelta
          : visualDelta;
      const fromIndex = order.indexOf(id);
      const nextIndex = Math.max(0, Math.min(order.length - 1, fromIndex + delta));
      moveByOffset(id, delta);
      announceMove(nextIndex + 1, order.length, label);
    },
    [announceMove, columns, direction, id, label, moveByOffset, moveTo, order],
  );

  return (
    <div
      data-sortable-layout-id={layoutId}
      data-sortable-widget-id={id}
      className={cn(
        "relative min-w-0 h-full",
        isDragging && "z-10 opacity-80 ring-2 ring-brand/35",
        isDropTarget && "ring-2 ring-brand/50 ring-offset-2 ring-offset-background",
        className,
      )}
    >
      <div className="pointer-events-none absolute top-2 start-2 z-20">
        <button
          type="button"
          data-sortable-handle
          aria-label={handleLabel}
          aria-grabbed={isDragging}
          title={handleLabel}
          className={cn(
            "pointer-events-auto inline-flex size-7 touch-none items-center justify-center rounded-lg",
            "border border-border/70 bg-background/95 text-muted-foreground shadow-sm",
            "hover:bg-accent hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isDragging ? "cursor-grabbing" : "cursor-grab",
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
        >
          <GripVertical className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      {children}
    </div>
  );
}

SortableWidget.displayName = "SortableWidget";

function isSortableWidgetElement(child: ReactNode): child is ReactElement<SortableWidgetProps> {
  return isValidElement(child) && child.type === SortableWidget;
}

type SortableWidgetLayoutProps = {
  /** Unique per layout so each grid keeps its own saved order. */
  layoutId: string;
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  resettable?: boolean;
} & Omit<ComponentPropsWithoutRef<"div">, "children">;

export function SortableWidgetLayout({
  layoutId,
  children,
  columns,
  className,
  resettable = true,
  ...rest
}: SortableWidgetLayoutProps) {
  const t = useTranslation();
  const widgets = useMemo(
    () => Children.toArray(children).filter(isSortableWidgetElement),
    [children],
  );
  const defaultIds = useMemo(() => widgets.map((widget) => widget.props.id), [widgets]);
  const widgetsById = useMemo(() => {
    const map = new Map<string, ReactElement<SortableWidgetProps>>();
    for (const widget of widgets) {
      map.set(widget.props.id, widget);
    }
    return map;
  }, [widgets]);

  const { order, moveTo, moveByOffset, reset, isCustomized } = usePersistedOrder(
    layoutId,
    defaultIds,
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const announceMove = useCallback(
    (position: number, total: number, label?: string) => {
      if (position <= 0 || total <= 0) return;
      setAnnouncement(
        t.widgetMoved
          .replace("{title}", label ?? t.widgetLayoutRegion)
          .replace("{position}", String(position))
          .replace("{total}", String(total)),
      );
    },
    [t.widgetLayoutRegion, t.widgetMoved],
  );

  useEffect(() => {
    if (!draggingId) return;

    const previousCursor = document.body.style.cursor;
    const previousSelect = document.body.style.userSelect;
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousSelect;
    };
  }, [draggingId]);

  const contextValue = useMemo<SortableWidgetContextValue>(
    () => ({
      layoutId,
      columns,
      draggingId,
      overId,
      setDraggingId,
      setOverId,
      moveTo,
      moveByOffset,
      announceMove,
      order,
    }),
    [announceMove, columns, draggingId, layoutId, moveByOffset, moveTo, order, overId],
  );

  const orderedWidgets = order
    .map((id) => widgetsById.get(id))
    .filter((widget): widget is ReactElement<SortableWidgetProps> => widget != null);

  const showReset = resettable && isCustomized;
  const hasGridCols = className?.includes("grid-cols");
  const layoutClassName = cn(
    columns ? ["grid gap-4", gridClassMap[columns]] : hasGridCols ? "grid gap-4" : null,
    className,
  );

  if (widgets.length === 0) {
    return (
      <div className={layoutClassName} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <SortableWidgetContext.Provider value={contextValue}>
      <div
        role="group"
        aria-label={t.widgetLayoutRegion}
        className={cn("relative", layoutClassName)}
        {...rest}
      >
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
        {showReset ? (
          <div className="col-span-full flex justify-end">
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={reset}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              {t.widgetResetLayout}
            </AppButton>
          </div>
        ) : null}
        {orderedWidgets.map((widget) => (
          <Fragment key={widget.props.id}>{widget}</Fragment>
        ))}
      </div>
    </SortableWidgetContext.Provider>
  );
}
