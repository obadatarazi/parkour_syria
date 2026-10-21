import { useEffect, useRef, useState } from "react";

import { RoleForm } from "@/features/roles/components/RoleForm";
import { useRoleMutations } from "@/features/roles/hooks/use-role-mutations";
import { rolesService } from "@/features/roles/services/roles.service";
import type { Role } from "@/features/roles/types/roles.types";
import { isProtectedRole } from "@/features/roles/utils/is-protected-role";
import { CrudEntityDrawer, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type RoleFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  role?: Role | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function RoleFormDrawer({
  open,
  mode,
  role,
  onOpenChange,
  onSuccess,
}: RoleFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useRoleMutations({
    onSuccess: async () => {
      await onSuccess();
      onOpenChange(false);
    },
  });

  /**
   * Increments only on the rising edge of an open create session
   * (open create, or switch Edit → Create while the drawer stays open).
   * Does not change when permissions finish loading.
   */
  const [createSessionKey, setCreateSessionKey] = useState(0);
  const wasCreateOpenRef = useRef(false);

  useEffect(() => {
    const isCreateOpen = open && mode === "create";
    if (isCreateOpen && !wasCreateOpenRef.current) {
      setCreateSessionKey((current) => current + 1);
    }
    wasCreateOpenRef.current = isCreateOpen;
  }, [open, mode]);

  const { data: roleDetail, isLoading: isRoleLoading } = useCrudQuery({
    queryKey: ["roles", "detail", String(role?.id ?? "")],
    queryFn: () => rolesService.getById(role!.id),
    enabled: open && mode === "edit" && Boolean(role?.id),
  });

  const resolvedRole = mode === "edit" ? (roleDetail ?? role) : role;

  return (
    <CrudEntityDrawer
      open={open}
      formMode={mode}
      onOpenChange={onOpenChange}
      title={mode === "create" ? t.addRole : t.editRole}
      size="xl"
      isLoading={isSaving}
      isFetching={mode === "edit" && isRoleLoading}
      fetchingLabel={t.loadingMessage}
    >
      <RoleForm
        key={
          mode === "create"
            ? `create-${createSessionKey}`
            : `edit-${resolvedRole?.id ?? "none"}`
        }
        mode={mode}
        role={resolvedRole}
        createSessionKey={mode === "create" ? createSessionKey : undefined}
        isLoading={isSaving || (mode === "edit" && isRoleLoading)}
        onCancel={() => onOpenChange(false)}
        onSubmit={async (data) => {
          if (mode === "edit" && resolvedRole && isProtectedRole(resolvedRole)) {
            onOpenChange(false);
            return;
          }
          const result = await save(mode, data, resolvedRole ?? undefined);
          if (result === "skipped") onOpenChange(false);
        }}
      />
    </CrudEntityDrawer>
  );
}
