import { cn } from "@/shared/design-system/components/ui/utils";

const statusStyles = {
  success: "bg-success-muted text-success border-success/20",
  warning: "bg-warning-muted text-warning border-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info-muted text-info border-info/20",
  neutral: "bg-muted text-muted-foreground border-border",
} as const;

export type StatusBadgeVariant = keyof typeof statusStyles;

type StatusBadgeProps = {
  label: string;
  variant?: StatusBadgeVariant;
  className?: string;
};

export function StatusBadge({ label, variant = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      title={label}
      className={cn(
        "inline-flex max-w-full min-w-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold capitalize rtl:normal-case",
        statusStyles[variant],
        className,
      )}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
