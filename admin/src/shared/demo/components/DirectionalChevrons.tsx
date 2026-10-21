import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/design-system/components/ui/utils";
import { useLocalization } from "@/shared/design-system/localization/contexts/LocalizationContext";

type DirectionalChevronProps = {
  className?: string;
};

export function ChevronForward({ className }: DirectionalChevronProps) {
  const { direction } = useLocalization();
  const Icon = direction === "rtl" ? ChevronLeft : ChevronRight;
  return <Icon className={cn("size-4", className)} aria-hidden="true" />;
}

export function ChevronBack({ className }: DirectionalChevronProps) {
  const { direction } = useLocalization();
  const Icon = direction === "rtl" ? ChevronRight : ChevronLeft;
  return <Icon className={cn("size-4", className)} aria-hidden="true" />;
}
