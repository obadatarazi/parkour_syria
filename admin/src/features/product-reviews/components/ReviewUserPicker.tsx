import { Check, ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import {
  getReviewUserLabel,
  useReviewUserPicker,
} from "@/features/product-reviews/hooks/use-review-user-picker";
import { FormField, UserLabelText } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { cn } from "@/shared/design-system/components/ui/utils";

type ReviewUserPickerProps = {
  value: number | null;
  onChange: (userId: number | null) => void;
  disabled?: boolean;
  error?: string;
};

export function ReviewUserPicker({
  value,
  onChange,
  disabled = false,
  error,
}: ReviewUserPickerProps) {
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
    selectedUser,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useReviewUserPicker({ selectedId: value, enabled: !disabled, isOpen });

  return (
    <FormField label={t.reviewAuthor} fieldId={fieldId} error={error} required>
      <div className="space-y-3">
        {selectedUser ? (
          <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground">
            <UserLabelText value={getReviewUserLabel(selectedUser)} />
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{t.selectUser}</p>
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
                  const label = getReviewUserLabel(user);
                  const isSelected = value === user.id;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        onChange(user.id);
                        setIsOpen(false);
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
