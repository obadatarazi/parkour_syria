import { TicketPercent } from "lucide-react";

import type { CouponCompletenessItem } from "@/features/coupons/utils/coupon-form-completeness";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CouponFormPreviewCardProps = {
  code: string;
  offerLine: string;
  statusLabel: string;
  audienceLabel: string;
  appliesToChips: string[];
  hasMinimumCartSpend: boolean;
  completeness: CouponCompletenessItem[];
  completenessLabels: Record<string, string>;
  onJumpToSection: (section: CouponCompletenessItem["section"]) => void;
};

export function CouponFormPreviewCard({
  code,
  offerLine,
  statusLabel,
  audienceLabel,
  appliesToChips,
  hasMinimumCartSpend,
  completeness,
  completenessLabels,
  onJumpToSection,
}: CouponFormPreviewCardProps) {
  const t = useTranslation();
  const doneCount = completeness.filter((item) => item.done).length;
  const totalCount = completeness.length;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const displayCode = code.trim() || t.couponCode;

  return (
    <aside className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t.couponPreview}
        </p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {statusLabel}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground"
            aria-hidden="true"
          >
            <TicketPercent className="size-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="truncate font-mono text-base font-semibold tracking-wide text-foreground">
              {displayCode}
            </p>
            <p className="text-sm text-muted-foreground">{offerLine}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">{t.couponAudience}</span>
          <span className="font-medium text-foreground">{audienceLabel}</span>
        </div>
        {appliesToChips.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {appliesToChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {hasMinimumCartSpend ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          {t.couponUrlMinSpendHint}
        </p>
      ) : null}

      <div className="space-y-2 rounded-xl bg-muted/40 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">{t.couponCompleteness}</span>
          <span className="tabular-nums text-muted-foreground">
            {doneCount}/{totalCount}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              progress === 100 ? "bg-emerald-500" : "bg-brand",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <ul className="space-y-1.5 pt-1">
          {completeness.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onJumpToSection(item.section)}
                className="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-start text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    item.done ? "bg-emerald-500" : "bg-border",
                  )}
                  aria-hidden="true"
                />
                <span className={item.done ? "text-foreground" : undefined}>
                  {completenessLabels[item.id] ?? item.id}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
