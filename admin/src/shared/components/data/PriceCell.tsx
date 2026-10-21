import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type PriceCellProps = {
  /** Full label for tooltip / accessibility. */
  title: string;
  /**
   * One line for a single price, or two lines for a range
   * (e.g. `["13.50 –", "18.00 KWD"]`) — stacked below `xl`, inline at `xl+`.
   */
  lines: string[];
  /** Optional compare-at / regular price. */
  compareAt?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * Dense price display for list tables: ranges stack on ~13" screens to save width.
 */
export function PriceCell({ title, lines, compareAt, className }: PriceCellProps) {
  const isRange = lines.length > 1;

  return (
    <span
      title={title}
      className={cn(
        "inline-flex max-w-full font-bold text-foreground",
        isRange
          ? "flex-col items-center gap-0 leading-tight xl:flex-row xl:items-baseline xl:gap-1"
          : "items-center",
        className,
      )}
    >
      {lines.map((line) => (
        <span key={line} className="whitespace-nowrap">
          {line}
        </span>
      ))}
      {compareAt ? (
        <span className="mt-0.5 text-[10px] font-medium text-muted-foreground line-through xl:mt-0">
          {compareAt}
        </span>
      ) : null}
    </span>
  );
}
