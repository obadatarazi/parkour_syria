import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";
import { useLocalization } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ProfileInfoFieldProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  muted?: boolean;
  className?: string;
};

export function ProfileInfoField({
  icon: Icon,
  label,
  value,
  muted = false,
  className,
}: ProfileInfoFieldProps) {
  const { language } = useLocalization();
  const isArabic = language === "ar";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 text-start transition-colors",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1 text-start">
        <p
          className={cn(
            "text-xs font-medium text-muted-foreground",
            !isArabic && "tracking-wide uppercase",
          )}
        >
          {label}
        </p>
        <div
          className={cn(
            "mt-1.5 text-sm font-semibold leading-snug break-words",
            muted ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
