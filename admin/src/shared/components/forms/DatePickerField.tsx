import { ar as dateFnsAr, enUS as dateFnsEn } from "date-fns/locale";
import { Calendar as CalendarIcon, XIcon } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { type Matcher } from "react-day-picker";

import { FormField, getFormFieldDescribedBy } from "@/shared/components/forms/FormField";
import { Button } from "@/shared/design-system/components/ui/button";
import { Calendar } from "@/shared/design-system/components/ui/calendar";
import { Input } from "@/shared/design-system/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/design-system/components/ui/popover";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useLocalization } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  formatDatePickerDisplay,
  parseDateInputValue,
  resolveDatePickerMax,
  resolveDatePickerMin,
  startOfLocalDay,
  toDateInputValue,
  toDatetimeLocalInputValue,
} from "@/shared/lib/datetime.utils";

export type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mode?: "date" | "datetime";
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** ISO-like bound: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`. */
  min?: string;
  /** ISO-like bound: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`. */
  max?: string;
  /** Disallow selecting any day before today (local). */
  disablePast?: boolean;
  /** Disallow selecting any day after today (local). */
  disableFuture?: boolean;
  containerClassName?: string;
  allowClear?: boolean;
};

function padTimePart(value: number): string {
  return String(value).padStart(2, "0");
}

export function DatePickerField({
  label,
  value,
  onChange,
  mode = "date",
  placeholder,
  helperText,
  error,
  required,
  disabled = false,
  min,
  max,
  disablePast = false,
  disableFuture = false,
  containerClassName,
  allowClear = true,
}: DatePickerFieldProps) {
  const id = useId();
  const { language, t } = useLocalization();
  const [open, setOpen] = useState(false);

  const effectiveMin = resolveDatePickerMin({ mode, min, disablePast });
  const effectiveMax = resolveDatePickerMax({ mode, max, disableFuture });

  const selectedDate = useMemo(() => parseDateInputValue(value), [value]);
  const minDate = useMemo(() => parseDateInputValue(effectiveMin), [effectiveMin]);
  const maxDate = useMemo(() => parseDateInputValue(effectiveMax), [effectiveMax]);

  const [draftTime, setDraftTime] = useState(() => {
    if (selectedDate) {
      return `${padTimePart(selectedDate.getHours())}:${padTimePart(selectedDate.getMinutes())}`;
    }
    return "00:00";
  });

  useEffect(() => {
    if (!open) return;
    if (selectedDate) {
      setDraftTime(`${padTimePart(selectedDate.getHours())}:${padTimePart(selectedDate.getMinutes())}`);
    }
  }, [open, selectedDate]);

  const disabledMatchers = useMemo(() => {
    const matchers: Matcher[] = [];
    if (minDate) matchers.push({ before: startOfLocalDay(minDate) });
    if (maxDate) matchers.push({ after: startOfLocalDay(maxDate) });
    return matchers;
  }, [minDate, maxDate]);

  const startMonth = useMemo(() => {
    if (minDate) return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    return new Date(new Date().getFullYear() - 100, 0);
  }, [minDate]);

  const endMonth = useMemo(() => {
    if (maxDate) return new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    return new Date(new Date().getFullYear() + 20, 11);
  }, [maxDate]);

  const displayValue = value
    ? formatDatePickerDisplay(value, language, mode === "datetime")
    : "";

  const resolvedPlaceholder = placeholder ?? t.selectDate;

  const applyDate = (day: Date | undefined) => {
    if (!day) {
      onChange("");
      return;
    }

    if (mode === "date") {
      onChange(toDateInputValue(day));
      setOpen(false);
      return;
    }

    const [hoursRaw, minutesRaw] = draftTime.split(":");
    const hours = Number(hoursRaw ?? "0");
    const minutes = Number(minutesRaw ?? "0");
    const next = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes, 0, 0);
    onChange(toDatetimeLocalInputValue(next));
  };

  const applyTime = (nextTime: string) => {
    setDraftTime(nextTime);
    const base = selectedDate ?? new Date();
    const [hoursRaw, minutesRaw] = nextTime.split(":");
    const hours = Number(hoursRaw ?? "0");
    const minutes = Number(minutesRaw ?? "0");
    const next = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes, 0, 0);

    if (minDate && next < minDate) return;
    if (maxDate && next > maxDate) return;

    onChange(toDatetimeLocalInputValue(next));
  };

  return (
    <FormField
      label={label}
      fieldId={id}
      required={required}
      helperText={helperText}
      error={error}
      containerClassName={containerClassName}
    >
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={getFormFieldDescribedBy(id, { error, helperText })}
            className={cn(
              "border-input dark:bg-input/30 flex h-9 w-full min-w-0 items-center gap-2 rounded-xl border bg-input-background px-3 py-1 text-start text-sm transition-[color,box-shadow] outline-none",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              !displayValue && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{displayValue || resolvedPlaceholder}</span>
            {allowClear && value && !disabled ? (
              <span
                role="button"
                tabIndex={-1}
                className="rounded-md p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label={t.clearDate}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onChange("");
                  }
                }}
              >
                <XIcon className="size-3.5" />
              </span>
            ) : null}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[80] w-auto min-w-[18.5rem] p-0"
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selectedDate}
            onSelect={applyDate}
            disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
            startMonth={startMonth}
            endMonth={endMonth}
            defaultMonth={selectedDate ?? minDate ?? new Date()}
            locale={language === "ar" ? dateFnsAr : dateFnsEn}
            dir={language === "ar" ? "rtl" : "ltr"}
            className="w-full [--cell-size:2.25rem]"
          />
          {mode === "datetime" ? (
            <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor={`${id}-time`}>
                {t.time}
              </label>
              <Input
                id={`${id}-time`}
                type="time"
                value={draftTime}
                onChange={(event) => applyTime(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                className="h-8 min-w-[7.5rem] flex-1"
              />
              <Button type="button" size="sm" className="ms-auto shrink-0" onClick={() => setOpen(false)}>
                {t.done}
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </FormField>
  );
}
