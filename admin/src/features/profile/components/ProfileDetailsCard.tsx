import { CalendarDays, Mail, Pencil, Phone, UserRound } from "lucide-react";
import { useState } from "react";

import type { AuthUser } from "@/features/auth/types/auth.types";
import type { ChangePasswordInput, ProfileUpdateInput } from "@/features/auth/types/auth.types";
import { ProfileEditDialog } from "@/features/profile/components/ProfileEditDialog";
import { ProfileInfoField } from "@/features/profile/components/ProfileInfoField";
import { ProfileSecurityForm } from "@/features/profile/components/ProfileSecurityForm";
import {
  formatProfileDate,
  resolveGenderLabel,
  splitFullName,
} from "@/features/profile/utils/profile-display.utils";
import { AppBadge, PhoneNumberText } from "@/shared/components";
import { AppButton } from "@/shared/components/buttons/AppButton";
import { AppCard } from "@/shared/components/layout/AppCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/design-system/components/ui/tabs";
import { useLocalization, useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ProfileDetailsCardProps = {
  user: AuthUser;
  profileValues: ProfileUpdateInput;
  isSavingProfile?: boolean;
  onSaveProfile: (input: ProfileUpdateInput) => Promise<void>;
  onChangePassword: (input: ChangePasswordInput) => Promise<void>;
};

export function ProfileDetailsCard({
  user,
  profileValues,
  isSavingProfile = false,
  onSaveProfile,
  onChangePassword,
}: ProfileDetailsCardProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const [editOpen, setEditOpen] = useState(false);
  const { firstName, lastName } = splitFullName(user.name);
  const formattedDateOfBirth = formatProfileDate(user.dateOfBirth, language);
  const genderLabel = resolveGenderLabel(user, t);

  return (
    <>
      <AppCard padding="none" className="overflow-hidden">
        <Tabs defaultValue="personal" className="gap-0">
          <div className="px-6 pt-4">
            <TabsList className="h-auto w-full justify-start gap-2 rounded-xl bg-muted p-1">
              <TabsTrigger
                value="personal"
                className="h-9 flex-none rounded-lg px-4 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {t.personalInformation}
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="h-9 flex-none rounded-lg px-4 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {t.security}
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="h-9 flex-none rounded-lg px-4 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {t.accountSettings}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="personal" className="space-y-6 px-6 pt-6 pb-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileInfoField
                icon={UserRound}
                label={t.firstName}
                value={firstName || t.notSet}
                muted={!firstName}
              />
              <ProfileInfoField
                icon={UserRound}
                label={t.lastName}
                value={lastName || t.notSet}
                muted={!lastName}
              />
              <ProfileInfoField
                icon={Mail}
                label={t.email}
                value={user.email || t.notSet}
                muted={!user.email}
              />
              <ProfileInfoField
                icon={UserRound}
                label={t.gender}
                value={genderLabel}
                muted={genderLabel === t.notSet}
              />
              <ProfileInfoField
                icon={Phone}
                label={t.phone}
                value={
                  user.phoneNumber ? (
                    <PhoneNumberText value={user.phoneNumber} />
                  ) : (
                    t.notSet
                  )
                }
                muted={!user.phoneNumber}
              />
              <ProfileInfoField
                icon={CalendarDays}
                label={t.dateOfBirth}
                value={formattedDateOfBirth || t.notSet}
                muted={!formattedDateOfBirth}
              />
            </div>

            <div className="flex justify-end border-t border-border/60 pt-4">
              <AppButton type="button" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" aria-hidden />
                {t.editProfile}
              </AppButton>
            </div>
          </TabsContent>

          <TabsContent value="security" className="px-6 pt-6 pb-6">
            <ProfileSecurityForm onChangePassword={onChangePassword} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 px-6 pt-6 pb-6">
            <p className="text-start text-sm text-muted-foreground">
              {t.profileSettingsDescription}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileInfoField icon={UserRound} label={t.role} value={user.role} />
              <ProfileInfoField
                icon={UserRound}
                label={t.status}
                value={
                  <AppBadge
                    label={user.active === false ? t.inactive : t.active}
                    variant={user.active === false ? "neutral" : "success"}
                  />
                }
              />
            </div>
          </TabsContent>
        </Tabs>
      </AppCard>

      <ProfileEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialValues={profileValues}
        hasExistingAvatar={Boolean(user.avatarFileUrl)}
        isSaving={isSavingProfile}
        onSave={onSaveProfile}
      />
    </>
  );
}
