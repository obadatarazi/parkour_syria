import { cn } from "@/shared/design-system/components/ui/utils";

type RequiredIndicatorProps = {
  className?: string;
};

export function RequiredIndicator({ className }: RequiredIndicatorProps) {
  return (
    <span className={cn("text-destructive ms-1", className)} aria-hidden="true">
      *
    </span>
  );
}
