import { type ReactNode, useEffect, useState } from "react";

import { RolePicker } from "@/features/roles/components/RolePicker";
import { useUserTypeOptions } from "@/features/users/hooks/use-user-type-options";
import type { AdminUser, UserFormData, UserType } from "@/features/users/types/users.types";
import { createEmptyUserForm, userToFormData } from "@/features/users/types/users.types";
import {
  CheckboxField,
  DatePickerField,
  EmailField,
  PasswordField,
  PhoneField,
  SelectField,
  TextField,
  ToggleField,
} from "@/shared/components";
import { CrudFileUpload, CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useUserGenderOptions } from "@/shared/hooks/use-options";
import type { FieldErrors } from "@/shared/types";

type UserFormProps = {
  mode: "create" | "edit";
  user?: AdminUser | null;
  isLoading?: boolean;
  fixedType?: UserType;
  onSubmit: (data: UserFormData) => void | Promise<void>;
  onCancel: () => void;
  /** Reports whether the form has unsaved changes since it was last reset. */
  onDirtyChange?: (isDirty: boolean) => void;
};

type UserFormErrors = FieldErrors<
  "fullName" | "phoneNumber" | "whatsappPhoneNumber" | "password" | "passwordConfirmation" | "type"
>;

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

export function UserForm({
  mode,
  user,
  isLoading = false,
  fixedType,
  onSubmit,
  onCancel,
  onDirtyChange,
}: UserFormProps) {
  const t = useTranslation();
  const { options: userTypeOptions, isLoading: isUserTypeLoading } = useUserTypeOptions();
  const { options: genderOptions, isLoading: isGenderOptionsLoading } = useUserGenderOptions();
  const [form, setForm] = useState<UserFormData>(createEmptyUserForm());
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm(
      user
        ? userToFormData(user)
        : createEmptyUserForm(fixedType ?? "CUSTOMER"),
    );
    setErrors({});
    setIsDirty(false);
  }, [user, mode, fixedType]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateField = <TField extends keyof UserFormData>(
    field: TField,
    value: UserFormData[TField],
  ) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "type" && value !== "ADMIN") {
        next.roles = [];
      }
      return next;
    });
    setIsDirty(true);
    if (errors[field as keyof UserFormErrors]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: UserFormErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = t.required;
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = t.required;
    if (!form.type) nextErrors.type = t.required;

    const whatsappNumber = form.whatsappPhoneNumber?.trim() ?? "";
    const accountPhone = form.phoneNumber.trim();
    if (form.whatsappNotificationsEnabled && !whatsappNumber && !accountPhone) {
      nextErrors.whatsappPhoneNumber = t.whatsappPhoneNumberRequired;
    }

    if (mode === "create") {
      if (!form.password?.trim()) nextErrors.password = t.required;
      if (form.password !== form.passwordConfirmation) {
        nextErrors.passwordConfirmation = t.passwordMismatch;
      }
    } else if (form.password && form.password !== form.passwordConfirmation) {
      nextErrors.passwordConfirmation = t.passwordMismatch;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    void onSubmit({
      ...form,
      whatsappPhoneNumber: whatsappNumber,
      type: fixedType ?? form.type,
    });
  };

  const typeOptions =
    userTypeOptions.length > 0
      ? userTypeOptions
      : [
          { value: "ADMIN", label: t.adminUserType },
          { value: "CUSTOMER", label: t.customerUserType },
        ];

  const resolvedType = fixedType ?? form.type;

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.userContent}>
        <TextField
          label={t.name}
          value={form.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          error={errors.fullName}
          required
        />

        <EmailField
          label={t.email}
          value={form.email ?? ""}
          onChange={(event) => updateField("email", event.target.value)}
        />

        <PhoneField
          label={t.phone}
          value={form.phoneNumber}
          onChange={(event) => updateField("phoneNumber", event.target.value)}
          error={errors.phoneNumber}
          required
        />

        <SelectField
          label={t.gender}
          value={form.gender ?? ""}
          onValueChange={(value) => updateField("gender", value as UserFormData["gender"])}
          options={genderOptions}
          placeholder={t.filterAll}
          disabled={isGenderOptionsLoading}
        />

        <DatePickerField
          label={t.dateOfBirth}
          mode="date"
          value={form.dateOfBirth ?? ""}
          onChange={(dateOfBirth) => updateField("dateOfBirth", dateOfBirth)}
          disableFuture
        />
      </FormSection>

      <FormSection title={t.whatsappPreferences} description={t.whatsappPreferencesHint}>
        <PhoneField
          label={t.whatsappPhoneNumber}
          value={form.whatsappPhoneNumber ?? ""}
          onChange={(event) => updateField("whatsappPhoneNumber", event.target.value)}
          error={errors.whatsappPhoneNumber}
          helperText={t.whatsappPhoneNumberHint}
        />

        <ToggleField
          label={t.whatsappNotificationsEnabled}
          description={t.whatsappNotificationsHint}
          checked={form.whatsappNotificationsEnabled ?? false}
          onCheckedChange={(checked) => updateField("whatsappNotificationsEnabled", checked)}
        />
      </FormSection>

      <FormSection title={t.security}>
        {fixedType ? null : (
          <SelectField
            label={t.userType}
            value={form.type}
            onValueChange={(value) => updateField("type", value as UserFormData["type"])}
            options={typeOptions}
            error={errors.type}
            required
            disabled={isUserTypeLoading}
          />
        )}

        {resolvedType === "ADMIN" ? (
          <RolePicker
            value={form.roles}
            onChange={(roles) => updateField("roles", roles)}
            disabled={isLoading}
          />
        ) : null}

        <PasswordField
          label={mode === "create" ? t.password : t.newPassword}
          value={form.password ?? ""}
          onChange={(event) => updateField("password", event.target.value)}
          error={errors.password}
          required={mode === "create"}
        />

        <PasswordField
          label={t.confirmPassword}
          value={form.passwordConfirmation ?? ""}
          onChange={(event) => updateField("passwordConfirmation", event.target.value)}
          error={errors.passwordConfirmation}
          required={mode === "create" || Boolean(form.password)}
        />

        <CheckboxField
          label={t.active}
          checked={form.active ?? true}
          onCheckedChange={(checked) => updateField("active", checked)}
        />
      </FormSection>

      <FormSection title={t.avatar}>
        <CrudFileUpload
          label={t.avatar}
          accept="image/*"
          helperText={user?.avatarFileUrl ? t.replaceImageHint : undefined}
          value={form.avatar ?? null}
          onFileSelect={(file) => updateField("avatar", file)}
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addUser : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
