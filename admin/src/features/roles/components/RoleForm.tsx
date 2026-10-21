import { useEffect, useRef, useState } from "react";

import { usePermissionsList } from "@/features/roles/hooks/use-permissions-list";
import { usePermissionsBySection } from "@/features/roles/hooks/use-role-mutations";
import type { Role, RoleFormData } from "@/features/roles/types/roles.types";
import {
  createEmptyRoleForm,
  getUnmappedRolePermissionNames,
  roleToFormData,
} from "@/features/roles/types/roles.types";
import { AppButton, CheckboxField, TextField } from "@/shared/components";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import type { FieldErrors } from "@/shared/types";

type RoleFormProps = {
  mode: "create" | "edit";
  role?: Role | null;
  /** Bumps on each new create drawer session so drafts do not carry over. */
  createSessionKey?: number;
  isLoading?: boolean;
  onSubmit: (data: RoleFormData) => void | Promise<void>;
  onCancel: () => void;
};

type RoleFormErrors = FieldErrors<"name">;

export function RoleForm({
  mode,
  role,
  createSessionKey = 0,
  isLoading = false,
  onSubmit,
  onCancel,
}: RoleFormProps) {
  const t = useTranslation();
  const { data: permissionSections = [], isLoading: isPermissionsLoading } =
    usePermissionsBySection();
  const {
    permissionNameToId,
    isComplete: isPermissionsComplete,
    isSaveBlocked: isPermissionsSaveBlocked,
    isLoading: isPermissionsListLoading,
    isError: isPermissionsListError,
    error: permissionsListError,
    refetch: refetchPermissions,
  } = usePermissionsList();
  const [form, setForm] = useState<RoleFormData>(createEmptyRoleForm());
  const [errors, setErrors] = useState<RoleFormErrors>({});
  const [hasUnmappedPermissions, setHasUnmappedPermissions] = useState(false);

  /**
   * Tracks which form identity was last hydrated so async permission-map
   * completion cannot wipe create-mode user input, while edit still hydrates
   * once the complete map is available.
   *
   * Create identity includes createSessionKey so each new create drawer open
   * is a fresh session (without remounting solely because permissions loaded).
   */
  const hydratedIdentityRef = useRef<string | null>(null);
  const formIdentity =
    mode === "edit" && role
      ? `edit:${role.id}:${(role.permissions ?? []).slice().sort().join("|")}`
      : `create:${createSessionKey}`;

  useEffect(() => {
    if (mode === "create") {
      // Create initializes once per create session — never when permissions finish loading.
      if (hydratedIdentityRef.current === formIdentity) return;
      hydratedIdentityRef.current = formIdentity;
      setForm(createEmptyRoleForm());
      setErrors({});
      setHasUnmappedPermissions(false);
      return;
    }

    // Edit: wait for a complete name→id map, then hydrate once per role id.
    if (!role || !isPermissionsComplete) return;
    if (hydratedIdentityRef.current === formIdentity) return;

    const unmapped = getUnmappedRolePermissionNames(role, permissionNameToId);
    if (unmapped.length > 0) {
      setHasUnmappedPermissions(true);
      // Do not hydrate a silently truncated permission set.
      return;
    }

    hydratedIdentityRef.current = formIdentity;
    setHasUnmappedPermissions(false);
    setForm(roleToFormData(role, permissionNameToId));
    setErrors({});
  }, [mode, formIdentity, role, isPermissionsComplete, permissionNameToId]);

  const togglePermission = (permissionId: number, checked: boolean) => {
    setForm((current) => ({
      ...current,
      permissions: checked
        ? [...current.permissions, permissionId]
        : current.permissions.filter((id) => id !== permissionId),
    }));
  };

  const isSaveBlocked = isPermissionsSaveBlocked || hasUnmappedPermissions;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaveBlocked) return;

    const nextErrors: RoleFormErrors = {};
    if (!form.name.trim()) nextErrors.name = t.required;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    void onSubmit(form);
  };

  const showPermissionsLoadError =
    isPermissionsListError ||
    hasUnmappedPermissions ||
    (!isPermissionsListLoading && !isPermissionsComplete);

  return (
    <CrudFormShell onSubmit={handleSubmit}>
      <TextField
        label={t.roleName}
        value={form.name}
        onChange={(event) => {
          setForm((current) => ({ ...current, name: event.target.value }));
          if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
        }}
        error={errors.name}
        required
      />

      <CheckboxField
        label={t.standardRole}
        checked={form.standard ?? false}
        onCheckedChange={(checked) => setForm((current) => ({ ...current, standard: checked }))}
      />

      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">{t.permissions}</p>

        {showPermissionsLoadError ? (
          <div className="space-y-2 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{t.permissionsLoadFailed}</p>
            {permissionsListError ? (
              <p className="text-xs text-muted-foreground">
                {resolveServiceErrorMessage(permissionsListError, t)}
              </p>
            ) : null}
            <AppButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setHasUnmappedPermissions(false);
                hydratedIdentityRef.current = null;
                void refetchPermissions();
              }}
            >
              {t.tryAgain}
            </AppButton>
          </div>
        ) : null}

        {isPermissionsLoading || isPermissionsListLoading ? (
          <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
        ) : permissionSections.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.noData}</p>
        ) : (
          permissionSections.map((section) => (
            <div key={section.section} className="space-y-2 rounded-xl border border-border/60 p-4">
              <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                {section.section}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {section.roles.map((permission) => (
                  <CheckboxField
                    key={permission.id}
                    label={permission.description || permission.name}
                    checked={form.permissions.includes(permission.id)}
                    onCheckedChange={(checked) => togglePermission(permission.id, checked)}
                    disabled={isSaveBlocked}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addRole : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
        submitDisabled={isSaveBlocked}
      />
    </CrudFormShell>
  );
}
