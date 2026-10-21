import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

const MARGIN = 16;
const GAP = 12;
/** Vertical slot reserved per stacked panel (covers expanded dock/checklist). */
const STACK_SLOT = 300;
const STORAGE_PREFIX = "aroma-guidance-panel-pos:";

export type GuidancePanelPosition = {
  x: number;
  y: number;
};

type GuidanceFloatingPanelProps = {
  panelId: string;
  /** 0 = bottom of the default stack, higher = further up */
  stackOrder: number;
  /** Used before the panel is measured */
  estimatedHeight?: number;
  dragLabel: string;
  children: ReactNode;
  className?: string;
  /** Header / drag surface — place title + actions here */
  header: ReactNode;
};

function readStoredPosition(panelId: string): GuidancePanelPosition | null {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${panelId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuidancePanelPosition;
    if (typeof parsed.x !== "number" || typeof parsed.y !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredPosition(panelId: string, position: GuidancePanelPosition) {
  sessionStorage.setItem(`${STORAGE_PREFIX}${panelId}`, JSON.stringify(position));
}

function clampPosition(
  position: GuidancePanelPosition,
  width: number,
  height: number,
): GuidancePanelPosition {
  const maxX = Math.max(MARGIN, window.innerWidth - width - MARGIN);
  const maxY = Math.max(MARGIN, window.innerHeight - height - MARGIN);
  return {
    x: Math.min(Math.max(MARGIN, position.x), maxX),
    y: Math.min(Math.max(MARGIN, position.y), maxY),
  };
}

function defaultStackPosition(
  stackOrder: number,
  width: number,
  height: number,
  estimatedHeight: number,
): GuidancePanelPosition {
  const panelHeight = height > 0 ? height : estimatedHeight;
  const stackedBelow = stackOrder * (STACK_SLOT + GAP);
  const isRtl = document.documentElement.dir === "rtl";
  const x = isRtl ? Math.max(MARGIN, window.innerWidth - width - MARGIN) : MARGIN;
  const y = Math.max(MARGIN, window.innerHeight - MARGIN - panelHeight - stackedBelow);
  return { x, y };
}

export function GuidanceFloatingPanel({
  panelId,
  stackOrder,
  estimatedHeight = 280,
  dragLabel,
  header,
  children,
  className,
}: GuidanceFloatingPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [size, setSize] = useState({ width: 296, height: estimatedHeight });
  const [position, setPosition] = useState<GuidancePanelPosition | null>(null);
  const [hasCustomPosition, setHasCustomPosition] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const stored = readStoredPosition(panelId);
    if (stored) {
      setPosition(stored);
      setHasCustomPosition(true);
    }
  }, [panelId]);

  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (hasCustomPosition) return;
    setPosition(defaultStackPosition(stackOrder, size.width, size.height, estimatedHeight));
  }, [estimatedHeight, hasCustomPosition, size.height, size.width, stackOrder]);

  useEffect(() => {
    if (!position || !hasCustomPosition) return;
    const clamped = clampPosition(position, size.width, size.height);
    if (clamped.x !== position.x || clamped.y !== position.y) {
      setPosition(clamped);
      writeStoredPosition(panelId, clamped);
    }
  }, [hasCustomPosition, panelId, position, size.height, size.width]);

  useEffect(() => {
    const onResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        if (hasCustomPosition) {
          const next = clampPosition(prev, size.width, size.height);
          writeStoredPosition(panelId, next);
          return next;
        }
        return defaultStackPosition(stackOrder, size.width, size.height, estimatedHeight);
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [estimatedHeight, hasCustomPosition, panelId, size.height, size.width, stackOrder]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement;
      if (target.closest("button, a, input, textarea, select, [data-no-drag]")) return;

      const node = panelRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      dragRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      setHasCustomPosition(true);
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const next = clampPosition(
        {
          x: event.clientX - drag.offsetX,
          y: event.clientY - drag.offsetY,
        },
        size.width,
        size.height,
      );
      setPosition(next);
    },
    [size.height, size.width],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      setIsDragging(false);
      setPosition((prev) => {
        if (!prev) return prev;
        writeStoredPosition(panelId, prev);
        return prev;
      });
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // capture may already be released
      }
    },
    [panelId],
  );

  const style: CSSProperties | undefined = position
    ? {
        position: "fixed",
        left: position.x,
        top: position.y,
        right: "auto",
        bottom: "auto",
        zIndex: isDragging ? 50 : 40,
      }
    : {
        position: "fixed",
        left: MARGIN,
        bottom: MARGIN + stackOrder * (STACK_SLOT + GAP),
        zIndex: 40,
        visibility: "hidden",
      };

  return (
    <div
      ref={panelRef}
      style={style}
      className={cn(
        "w-[min(100%-2rem,18.5rem)] rounded-2xl border border-border bg-card shadow-lg",
        className,
      )}
    >
      <div
        role="separator"
        aria-label={dragLabel}
        title={dragLabel}
        className={cn(
          "touch-none select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {header}
      </div>
      {children}
    </div>
  );
}
