import { Check, Loader2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import type { MultiTypeSetting } from "@/features/settings/types/settings.types";
import { parseSettingBoolean } from "@/features/settings/utils/setting-display";
import { PhoneNumberText } from "@/shared/components";
import { Input } from "@/shared/design-system/components/ui/input";
import { Switch } from "@/shared/design-system/components/ui/switch";
import { cn } from "@/shared/design-system/components/ui/utils";

type SettingInlineValueCellProps = {
  setting: MultiTypeSetting;
  displayValue: string;
  canEdit: boolean;
  disabled?: boolean;
  disabledHint?: string;
  editHint: string;
  cancelLabel: string;
  activeLabel: string;
  inactiveLabel: string;
  onSave: (nextValue: string) => Promise<boolean>;
};

function resolveInputType(type: MultiTypeSetting["type"]): "text" | "email" | "tel" | "url" {
  if (type === "EMAIL") return "email";
  if (type === "PHONE_NUMBER") return "tel";
  if (type === "LINK") return "url";
  return "text";
}

export function SettingInlineValueCell({
  setting,
  displayValue,
  canEdit,
  disabled = false,
  disabledHint,
  editHint,
  cancelLabel,
  activeLabel,
  inactiveLabel,
  onSave,
}: SettingInlineValueCellProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(setting.value);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const isBoolean = setting.type === "BOOLEAN";
  const checked = parseSettingBoolean(setting.value);

  useEffect(() => {
    if (!editing) setDraft(setting.value);
  }, [editing, setting.value]);

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

  const persist = async (nextValue: string) => {
    if (nextValue === setting.value) {
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
      setDraft(setting.value);
    }
  };

  const startEditing = () => {
    if (!canEdit || disabled || saving || isBoolean) return;
    setDraft(setting.value);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(setting.value);
    setEditing(false);
  };

  const statusIcon = saving ? (
    <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
  ) : justSaved ? (
    <Check className="size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
  ) : null;

  if (isBoolean) {
    return (
      <div className="flex items-center gap-2 text-start">
        <Switch
          checked={checked}
          disabled={!canEdit || disabled || saving}
          aria-label={displayValue}
          onCheckedChange={(next) => {
            void persist(next ? "true" : "false");
          }}
          className={cn("shrink-0", saving && "opacity-60")}
        />
        <span className="min-w-0 truncate text-sm text-muted-foreground">
          {checked ? activeLabel : inactiveLabel}
        </span>
        {statusIcon}
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex w-full min-w-0 items-center gap-1 text-start">
        <Input
          ref={inputRef}
          id={inputId}
          type={resolveInputType(setting.type)}
          dir={setting.type === "PHONE_NUMBER" ? "ltr" : undefined}
          value={draft}
          aria-label={displayValue}
          disabled={saving}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void persist(draft);
            }
            if (event.key === "Escape") {
              event.preventDefault();
              cancelEditing();
            }
          }}
          onBlur={() => {
            void persist(draft);
          }}
          className={cn(
            "h-8 min-w-0 flex-1 rounded-lg px-2 text-sm",
            setting.type === "PHONE_NUMBER" && "rtl:text-right",
          )}
        />
        <button
          type="button"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          aria-label={displayValue}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => void persist(draft)}
        >
          <Check className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
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
    <div
      role={canEdit ? "button" : undefined}
      tabIndex={canEdit && !disabled ? 0 : undefined}
      title={canEdit ? (disabled ? disabledHint : editHint) : undefined}
      aria-label={
        canEdit ? `${displayValue}. ${disabled ? disabledHint ?? "" : editHint}` : undefined
      }
      onDoubleClick={canEdit ? startEditing : undefined}
      onKeyDown={
        canEdit
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                startEditing();
              }
            }
          : undefined
      }
      className={cn(
        "flex w-full min-w-0 items-center gap-1.5 text-start text-sm text-foreground",
        canEdit && !disabled && "cursor-text rounded-md hover:bg-muted/60",
        canEdit && disabled && "cursor-not-allowed opacity-70",
        justSaved && "rounded-md bg-emerald-50/80",
      )}
    >
      <span className="min-w-0 flex-1 break-all whitespace-normal">
        {setting.type === "PHONE_NUMBER" ? (
          <PhoneNumberText value={displayValue} />
        ) : (
          displayValue
        )}
      </span>
      {statusIcon}
    </div>
  );
}
