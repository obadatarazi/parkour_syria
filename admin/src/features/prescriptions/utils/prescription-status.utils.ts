import type { StatusBadgeVariant } from "@/shared/components";

export function getPrescriptionStatusVariant(
  value?: string | null,
): StatusBadgeVariant {
  switch (value) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    case "PENDING":
      return "warning";
    default:
      return "neutral";
  }
}
