import { Check, ChevronDown, X } from "lucide-react";
import { type ReactNode, useEffect, useId, useMemo, useState } from "react";

import type {
  NotificationRoute,
  NotificationRouteFormData,
  NotificationRouteFormRecipient,
} from "@/features/notification-routes/types/notification-routes.types";
import {
  createEmptyNotificationRouteForm,
  notificationRouteToFormData,
} from "@/features/notification-routes/types/notification-routes.types";
import {
  getNotificationRecipientLabel,
  useNotificationRecipientsPicker,
} from "@/features/notifications/hooks/use-notification-recipients-picker";
import { AppButton, UserLabelText } from "@/shared/components";
import { CheckboxField } from "@/shared/components";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

type NotificationRouteFormProps = {
  mode: "edit";
  entity?: NotificationRoute | null;
  isLoading?: boolean;
  onSubmit: (data: NotificationRouteFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-muted/15 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function NotificationRouteForm({
  entity,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: NotificationRouteFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<NotificationRouteFormData>(createEmptyNotificationRouteForm());
  const [recipientErrors, setRecipientErrors] = useState<Record<number, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const fieldId = useId();

  const recipientIds = useMemo(() => form.recipients.map((recipient) => recipient.userId), [form.recipients]);
  const {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageUsers,
    selectedUsers,
    isLoading: isPickerLoading,
    isError: isPickerError,
    error: pickerError,
    refetch: refetchPicker,
  } = useNotificationRecipientsPicker({
    selectedIds: recipientIds,
    enabled: !isLoading,
    isOpen: isPickerOpen,
    type: "ADMIN",
  });

  useEffect(() => {
    setForm(entity ? notificationRouteToFormData(entity) : createEmptyNotificationRouteForm());
    setRecipientErrors({});
    setIsDirty(false);
    setIsPickerOpen(false);
  }, [entity]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (
    updater: (current: NotificationRouteFormData) => NotificationRouteFormData,
  ) => {
    setForm(updater);
    setIsDirty(true);
  };

  const setRecipientChannels = (userId: number, channels: Partial<NotificationRouteFormRecipient>) => {
    updateForm((current) => ({
      recipients: current.recipients.map((recipient) =>
        recipient.userId === userId ? { ...recipient, ...channels } : recipient,
      ),
    }));
    setRecipientErrors((current) => {
      if (!(userId in current)) return current;
      const next = { ...current };
      delete next[userId];
      return next;
    });
  };

  const handleRecipientSelectionChange = (nextIds: number[]) => {
    updateForm((current) => {
      const currentById = new Map(current.recipients.map((recipient) => [recipient.userId, recipient]));
      return {
        recipients: nextIds.map((userId) =>
          currentById.get(userId) ?? { userId, inApp: true, email: false },
        ),
      };
    });
    setRecipientErrors((current) => {
      const next: Record<number, string> = {};
      for (const [userId, error] of Object.entries(current)) {
        if (nextIds.includes(Number(userId))) {
          next[Number(userId)] = error;
        }
      }
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextRecipientErrors: Record<number, string> = {};

    for (const recipient of form.recipients) {
      if (!recipient.inApp && !recipient.email) {
        nextRecipientErrors[recipient.userId] = t.required;
      }
    }

    setRecipientErrors(nextRecipientErrors);
    if (Object.keys(nextRecipientErrors).length > 0) return;
    void onSubmit(form);
  };

  const selectedUsersById = useMemo(
    () => new Map(selectedUsers.map((user) => [user.id, user])),
    [selectedUsers],
  );

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.notificationRouteRecipients} description={t.notificationRouteFallbackHint}>
        <div className="space-y-3">
          {form.recipients.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.recipients.map((recipient) => {
                const user = selectedUsersById.get(recipient.userId);
                const label = user ? getNotificationRecipientLabel(user) : `#${recipient.userId}`;

                return (
                  <span
                    key={recipient.userId}
                    className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand"
                  >
                    <UserLabelText value={label} />
                    <button
                      type="button"
                      disabled={isLoading}
                      className="rounded-full p-0.5 hover:bg-brand/15"
                      aria-label={`${t.remove} ${label}`}
                      onClick={() =>
                        handleRecipientSelectionChange(
                          recipientIds.filter((id) => id !== recipient.userId),
                        )
                      }
                    >
                      <X className="size-3" aria-hidden="true" />
                    </button>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.notificationRouteFallbackHint}</p>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsPickerOpen((current) => !current)}
            disabled={isLoading}
            aria-expanded={isPickerOpen}
            aria-controls={fieldId}
          >
            <span>{isPickerOpen ? t.closePicker : t.notificationRouteAddRecipient}</span>
            <ChevronDown className={cn("size-4 transition-transform", isPickerOpen && "rotate-180")} />
          </Button>

          {form.recipients.length > 0 ? (
            <div className="flex justify-end">
              <AppButton
                type="button"
                variant="ghost"
                onClick={() => handleRecipientSelectionChange([])}
                disabled={isLoading}
              >
                {t.clearAll}
              </AppButton>
            </div>
          ) : null}

          {isPickerOpen ? (
            <div id={fieldId} className="space-y-3 rounded-xl border border-border bg-muted/10 p-3">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.notificationRouteRecipientSearchPlaceholder}
                disabled={isLoading}
              />

              {isPickerLoading && pageUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
              ) : isPickerError ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">
                    {resolveServiceErrorMessage(pickerError, t)}
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => void refetchPicker()}>
                    {t.tryAgain}
                  </Button>
                </div>
              ) : pageUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.noData}</p>
              ) : (
                <div className="max-h-52 space-y-1 overflow-y-auto">
                  {pageUsers.map((user) => {
                    const isSelected = recipientIds.includes(user.id);
                    const label = getNotificationRecipientLabel(user);

                    return (
                      <button
                        key={user.id}
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          handleRecipientSelectionChange(
                            isSelected
                              ? recipientIds.filter((id) => id !== user.id)
                              : [...recipientIds, user.id],
                          );
                        }}
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
                    disabled={isLoading || page <= 1}
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
                    disabled={isLoading || page >= totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  >
                    {t.nextPage}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </FormSection>

      <FormSection title={t.notificationRouteChannels}>
        {form.recipients.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.notificationRouteFallbackHint}</p>
        ) : (
          <div className="space-y-3">
            {form.recipients.map((recipient) => {
              const user = selectedUsersById.get(recipient.userId);
              const label = user ? getNotificationRecipientLabel(user) : `#${recipient.userId}`;
              const error = recipientErrors[recipient.userId];

              return (
                <div
                  key={recipient.userId}
                  className="space-y-3 rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        <UserLabelText value={label} />
                      </p>
                      {user?.email ? (
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      ) : null}
                    </div>
                    <AppButton
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        handleRecipientSelectionChange(
                          recipientIds.filter((id) => id !== recipient.userId),
                        )
                      }
                    >
                      {t.remove}
                    </AppButton>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <CheckboxField
                      label={t.notificationRouteInApp}
                      checked={recipient.inApp}
                      onCheckedChange={(checked) =>
                        setRecipientChannels(recipient.userId, { inApp: checked })
                      }
                      disabled={isLoading}
                    />
                    <CheckboxField
                      label={t.email}
                      checked={recipient.email}
                      onCheckedChange={(checked) =>
                        setRecipientChannels(recipient.userId, { email: checked })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  {error ? <p className="text-xs text-destructive">{error}</p> : null}
                </div>
              );
            })}
          </div>
        )}
      </FormSection>

      <CrudFormFooter
        submitLabel={t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
