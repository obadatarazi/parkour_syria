import { Check, Loader2 } from "lucide-react";

import { AppButton } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type NotificationMarkReadButtonProps = {
  read: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onMarkRead: () => void;
  className?: string;
};

/**
 * Unread → check button to mark as read.
 * Already read → subtle check (no unread toggle).
 */
export function NotificationMarkReadButton({
  read,
  disabled = false,
  isLoading = false,
  onMarkRead,
  className,
}: NotificationMarkReadButtonProps) {
  const t = useTranslation();

  if (read) {
    return (
      <span
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground",
          className,
        )}
        title={t.read}
        aria-label={t.read}
      >
        <Check className="size-4" aria-hidden="true" />
      </span>
    );
  }

  return (
    <AppButton
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "size-8 rounded-full p-0 text-brand hover:bg-brand/10 hover:text-brand",
        className,
      )}
      disabled={disabled || isLoading}
      aria-label={t.markRead}
      title={t.markRead}
      onClick={(event) => {
        event.stopPropagation();
        onMarkRead();
      }}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Check className="size-4" aria-hidden="true" />
      )}
    </AppButton>
  );
}
