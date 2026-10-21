import { Check, Loader2, Minus, Pencil, Plus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Input } from "@/shared/design-system/components/ui/input";
import { cn } from "@/shared/design-system/components/ui/utils";

type InventoryInlineNumberCellProps = {
  value: number;
  displayValue: string;
  canEdit: boolean;
  disabled?: boolean;
  min?: number;
  step?: number;
  integer?: boolean;
  ariaLabel: string;
  editHint: string;
  cancelLabel: string;
  showSteppers?: boolean;
  className?: string;
  onSave: (nextValue: number) => Promise<boolean>;
};

function roundToStep(value: number, step: number, integer: boolean): number {
  if (integer) return Math.trunc(value);
  const precision = Math.max(0, Math.round(-Math.log10(step)));
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function normalizeValue(raw: string, integer: boolean, min: number, step: number): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  const parsed = integer ? Number.parseInt(trimmed, 10) : Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed)) return null;

  const next = roundToStep(parsed, step, integer);
  if (next < min) return null;
  return next;
}

export function InventoryInlineNumberCell({
  value,
  displayValue,
  canEdit,
  disabled = false,
  min = 0,
  step = 1,
  integer = false,
  ariaLabel,
  editHint,
  cancelLabel,
  showSteppers = false,
  className,
  onSave,
}: InventoryInlineNumberCellProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!editing) {
      setDraft(String(value));
    }
  }, [editing, value]);

  useEffect(() => {
    if (!editing) return;
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [editing]);

  useEffect(() => {
    if (!justSaved) return;
    const timeout = window.setTimeout(() => setJustSaved(false), 900);
    return () => window.clearTimeout(timeout);
  }, [justSaved]);

  const startEditing = () => {
    if (!canEdit || disabled || saving) return;
    setDraft(String(value));
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(String(value));
    setEditing(false);
  };

  const commit = async (nextRaw: string) => {
    const nextValue = normalizeValue(nextRaw, integer, min, step);
    if (nextValue == null) {
      cancelEditing();
      return;
    }

    if (nextValue === value) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setEditing(false);
    const ok = await onSave(nextValue);
    setSaving(false);
    if (ok) {
      setJustSaved(true);
    } else {
      setDraft(String(value));
    }
  };

  const nudge = async (delta: number) => {
    if (!canEdit || disabled || saving || editing) return;
    const nextValue = Math.max(min, roundToStep(value + delta, step, integer));
    if (nextValue === value) return;

    setSaving(true);
    const ok = await onSave(nextValue);
    setSaving(false);
    if (ok) setJustSaved(true);
  };

  if (!canEdit) {
    return <span className={cn("text-xs font-semibold text-foreground", className)}>{displayValue}</span>;
  }

  if (editing) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Input
          ref={inputRef}
          id={inputId}
          type="number"
          inputMode={integer ? "numeric" : "decimal"}
          min={min}
          step={step}
          value={draft}
          aria-label={ariaLabel}
          disabled={saving}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void commit(draft);
            }
            if (event.key === "Escape") {
              event.preventDefault();
              cancelEditing();
            }
          }}
          onBlur={() => {
            void commit(draft);
          }}
          className="h-8 w-[5.5rem] rounded-lg px-2 text-xs font-semibold tabular-nums"
        />
        <button
          type="button"
          className="inline-flex size-7 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          aria-label={ariaLabel}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => void commit(draft)}
        >
          <Check className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          aria-label={cancelLabel}
          onMouseDown={(event) => event.preventDefault()}
          onClick={cancelEditing}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("group/inline flex items-center gap-1", className)}>
      {showSteppers ? (
        <button
          type="button"
          disabled={disabled || saving || value <= min}
          onClick={() => void nudge(-step)}
          aria-label={`${ariaLabel} -`}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-transparent text-muted-foreground opacity-0 transition group-hover/inline:opacity-100 hover:border-border hover:bg-muted focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-30"
        >
          <Minus className="size-3" aria-hidden="true" />
        </button>
      ) : null}

      <button
        type="button"
        disabled={disabled || saving}
        onClick={startEditing}
        title={editHint}
        aria-label={`${ariaLabel}. ${editHint}`}
        className={cn(
          "inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-transparent px-2 py-1 text-start transition",
          "hover:border-border hover:bg-muted/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
          justSaved && "border-emerald-200 bg-emerald-50/80",
          saving && "opacity-70",
        )}
      >
        <span className="text-xs font-semibold tabular-nums text-foreground">{displayValue}</span>
        {saving ? (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : justSaved ? (
          <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
        ) : (
          <Pencil
            className="size-3 text-muted-foreground opacity-0 transition group-hover/inline:opacity-100"
            aria-hidden="true"
          />
        )}
      </button>

      {showSteppers ? (
        <button
          type="button"
          disabled={disabled || saving}
          onClick={() => void nudge(step)}
          aria-label={`${ariaLabel} +`}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-transparent text-muted-foreground opacity-0 transition group-hover/inline:opacity-100 hover:border-border hover:bg-muted focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-30"
        >
          <Plus className="size-3" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
