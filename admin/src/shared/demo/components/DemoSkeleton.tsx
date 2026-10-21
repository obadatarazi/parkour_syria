import { cn } from "@/shared/design-system/components/ui/utils";

type DemoSkeletonProps = {
  className?: string;
  style?: React.CSSProperties;
};

export function DemoSkeleton({ className, style }: DemoSkeletonProps) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} style={style} />;
}
