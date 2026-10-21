import { cn } from "@/shared/design-system/components/ui/utils";
import type { BilingualTextValues } from "@/shared/lib/translation-display.utils";

type BilingualTextProps = {
  values: BilingualTextValues;
  titleClassName?: string;
  secondaryClassName?: string;
  className?: string;
};

/**
 * Stacks EN + AR copy. Script direction is set on inline spans so glyph shaping
 * is correct, while block alignment follows the parent (table cell / document).
 */
export function BilingualText({
  values,
  titleClassName,
  secondaryClassName,
  className,
}: BilingualTextProps) {
  const { en, ar } = values;

  if (!en && !ar) {
    return <span className={className}>—</span>;
  }

  if (en && ar && en === ar) {
    return (
      <span className={cn("font-semibold text-foreground", titleClassName, className)}>{en}</span>
    );
  }

  return (
    <div className={cn("space-y-0.5 text-start", className)}>
      {en ? (
        <div className={cn("font-semibold text-foreground", titleClassName)}>
          <span dir="ltr">{en}</span>
        </div>
      ) : null}
      {ar ? (
        <div className={cn("text-xs text-muted-foreground", secondaryClassName)}>
          <span dir="rtl">{ar}</span>
        </div>
      ) : null}
    </div>
  );
}
