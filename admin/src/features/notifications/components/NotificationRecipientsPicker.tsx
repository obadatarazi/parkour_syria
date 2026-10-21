import { Check, ChevronDown, X } from "lucide-react";
import { useId, useState } from "react";

import {
  getNotificationRecipientLabel,
  useNotificationRecipientsPicker,
} from "@/features/notifications/hooks/use-notification-recipients-picker";
import { FormField, UserLabelText } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

type NotificationRecipientsPickerProps = {
  value: number[];
  onChange: (userIds: number[]) => void;
  disabled?: boolean;
};

export function NotificationRecipientsPicker({
  value,
  onChange,
  disabled = false,
}: NotificationRecipientsPickerProps) {
  const t = useTranslation();
  const fieldId = useId();
  const panelId = `${fieldId}-panel`;
  const [isOpen, setIsOpen] = useState(false);
  const {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageUsers,
    selectedUsers,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useNotificationRecipientsPicker({
    selectedIds: value,
    enabled: !disabled,
    isOpen,
  });

  const toggleUser = (userId: number) => {
    if (value.includes(userId)) {
      onChange(value.filter((id) => id !== userId));
      return;
    }
    onChange([...value, userId]);
  };

  return (
    <FormField label={t.notificationRecipients} fieldId={fieldId}>
      <div className="space-y-3">
        {selectedUsers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <span
                key={user.id}
                className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand"
              >
                <UserLabelText value={getNotificationRecipientLabel(user)} />
                <button
                  type="button"
                  disabled={disabled}
                  className="rounded-full p-0.5 hover:bg-brand/15"
                  aria-label={`${t.remove} ${getNotificationRecipientLabel(user)}`}
                  onClick={() => onChange(value.filter((id) => id !== user.id))}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.notificationRecipientsHint}</p>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsOpen((current) => !current)}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-controls={panelId}
        >
          <span>{isOpen ? t.closePicker : t.selectUser}</span>
          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen ? (
          <div
            id={panelId}
            className="space-y-3 rounded-xl border border-border bg-muted/10 p-3"
          >
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.userSearchPlaceholder}
              disabled={disabled}
            />

            {isLoading && pageUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
            ) : isError ? (
              <div className="space-y-2">
                <p className="text-sm text-destructive">
                  {resolveServiceErrorMessage(queryError, t)}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                  {t.tryAgain}
                </Button>
              </div>
            ) : pageUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noData}</p>
            ) : (
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {pageUsers.map((user) => {
                  const label = getNotificationRecipientLabel(user);
                  const isSelected = value.includes(user.id);

                  return (
                    <button
                      key={user.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleUser(user.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/60",
                      )}
                    >
                      <span className="min-w-0 truncate">
                        <UserLabelText value={label} />
                      </span>
                      {isSelected ? <Check className="size-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            )}

            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  {t.previous}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  {t.nextPage}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </FormField>
  );
}
