import { useState } from "react";

import { UserForm } from "@/features/users/components/UserForm";
import { useUserMutations } from "@/features/users/hooks/use-user-mutations";
import { usersService } from "@/features/users/services/users.service";
import type { AdminUser, UserType } from "@/features/users/types/users.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UserFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  user?: AdminUser | null;
  fixedType?: UserType;
  createTitle?: string;
  editTitle?: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function UserFormDrawer({
  open,
  mode,
  user,
  fixedType,
  createTitle,
  editTitle,
  onOpenChange,
  onSuccess,
}: UserFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useUserMutations({
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

  const { data: userDetail, isLoading: isUserLoading } = useCrudQuery({
    queryKey: ["users", "detail", String(user?.id ?? "")],
    queryFn: () => usersService.getById(user!.id),
    enabled: open && mode === "edit" && Boolean(user?.id),
  });

  const resolvedUser = mode === "edit" ? (userDetail ?? user) : user;

  const requestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    onOpenChange(false);
  };

  return (
    <>
      <CrudEntityDrawer
        open={open}
        formMode={mode}
        onOpenChange={(next) => (next ? onOpenChange(next) : requestClose())}
        title={mode === "create" ? (createTitle ?? t.addUser) : (editTitle ?? t.editUser)}
        size="lg"
        isLoading={isSaving}
        isFetching={mode === "edit" && isUserLoading}
        fetchingLabel={t.loadingMessage}
      >
        <UserForm
          mode={mode}
          user={resolvedUser}
          fixedType={fixedType}
          isLoading={isSaving || (mode === "edit" && isUserLoading)}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            const result = await save(mode, data, resolvedUser ?? undefined);
            if (result === "skipped") {
              setIsDirty(false);
              onOpenChange(false);
            }
          }}
        />
      </CrudEntityDrawer>

      <ConfirmDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title={t.discardChangesTitle}
        description={t.discardChangesDescription}
        confirmLabel={t.discardChangesConfirm}
        cancelLabel={t.cancel}
        variant="destructive"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          setIsDirty(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
