import { Loader2 } from "lucide-react";

import { CaptionText } from "@/shared/components/typography/Typography";
import { Skeleton } from "@/shared/design-system/components/ui/skeleton";
import { cn } from "@/shared/design-system/components/ui/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
  variant?: "inline" | "section";
};

export function LoadingState({ label, className, variant = "section" }: LoadingStateProps) {
  if (variant === "inline") {
    return (
      <span
        className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {label ? <span>{label}</span> : null}
      </span>
    );
  }

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 py-12", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      {label ? <CaptionText>{label}</CaptionText> : null}
    </div>
  );
}

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

export function TableSkeleton({ rows = 5, columns = 5, className }: TableSkeletonProps) {
  return (
    <div className={cn("space-y-3 p-4", className)} aria-hidden="true">
      <div className="flex gap-3">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`head-${index}`} className="h-8 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

type StatCardSkeletonProps = {
  count?: number;
  className?: string;
};

export function StatCardSkeleton({ count = 4, className }: StatCardSkeletonProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="size-10 rounded-lg" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}
