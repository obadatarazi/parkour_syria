import type { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef, type ComponentProps } from "react";

import { Button, type buttonVariants } from "@/shared/design-system/components/ui/button";
import { cn } from "@/shared/design-system/components/ui/utils";

export type AppButtonProps = ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
    loadingText?: string;
  };

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton(
  { children, isLoading = false, loadingText, disabled, className, ...props },
  ref,
) {
  const isDisabled = disabled || isLoading;

  return (
    <Button
      ref={ref}
      className={cn(className)}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
});
