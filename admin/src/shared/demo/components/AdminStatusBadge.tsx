import { StatusBadge, type StatusBadgeVariant } from "@/shared/components";

const statusVariants: Record<string, StatusBadgeVariant> = {
  delivered: "success",
  shipped: "info",
  processing: "warning",
  pending: "neutral",
  cancelled: "danger",
  approved: "success",
  rejected: "danger",
  active: "success",
  inactive: "neutral",
  draft: "info",
  published: "success",
  expired: "neutral",
  paused: "warning",
  scheduled: "info",
  lowstock: "danger",
};

type AdminStatusBadgeProps = {
  status: string;
  label?: string;
  className?: string;
};

/** Demo helper — maps status strings onto the shared `StatusBadge` variants. */
export function AdminStatusBadge({ status, label, className }: AdminStatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/\s/g, "");
  const variant = statusVariants[normalized] ?? "neutral";

  return <StatusBadge label={label ?? status} variant={variant} className={className} />;
}
