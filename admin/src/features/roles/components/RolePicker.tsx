import { X } from "lucide-react";

import { useRolePicker } from "@/features/roles/hooks/use-role-picker";
import { roleDisplayName } from "@/features/roles/utils/role-label";
import { CheckboxField } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

type RolePickerProps = {
  value: number[];
  onChange: (roleIds: number[]) => void;
  disabled?: boolean;
};

export function RolePicker({ value, onChange, disabled = false }: RolePickerProps) {
  const t = useTranslation();
  const {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageRoles,
    selectedRoles,
    isLoading,
    isError,
    error,
    refetch,
  } = useRolePicker({ selectedIds: value, enabled: !disabled });

  const toggleRole = (roleId: number, checked: boolean) => {
    onChange(checked ? [...value, roleId] : value.filter((id) => id !== roleId));
  };

  const removeRole = (roleId: number) => {
    onChange(value.filter((id) => id !== roleId));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{t.roles}</p>

      {selectedRoles.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedRoles.map((role) => (
            <span
              key={role.id}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {roleDisplayName(t, role)}
              {!disabled ? (
                <button
                  type="button"
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => removeRole(role.id)}
                  aria-label={`${t.remove} ${roleDisplayName(t, role)}`}
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t.roleSearchPlaceholder}
        disabled={disabled}
      />

      {isLoading && pageRoles.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
      ) : isError ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">{resolveServiceErrorMessage(error, t)}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            {t.tryAgain}
          </Button>
        </div>
      ) : pageRoles.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.noData}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {pageRoles.map((role) => (
            <CheckboxField
              key={role.id}
              label={roleDisplayName(t, role)}
              checked={value.includes(role.id)}
              onCheckedChange={(checked) => toggleRole(role.id, checked)}
              disabled={disabled}
            />
          ))}
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
  );
}
