import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/features/auth";
import type { ProfileUpdateInput } from "@/features/auth/types/auth.types";
import { ProfileDetailsCard } from "@/features/profile/components/ProfileDetailsCard";
import { ProfileHeaderCard } from "@/features/profile/components/ProfileHeaderCard";
import { AppBadge, LoadingState, PageContainer } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { notify } from "@/shared/lib/notifications";

function buildProfileInput(user: NonNullable<ReturnType<typeof useAuth>["user"]>): ProfileUpdateInput {
  return {
    fullName: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber ?? "",
    gender: user.gender ?? undefined,
    dateOfBirth: user.dateOfBirth ?? "",
    avatar: null,
  };
}

export function ProfilePage() {
  const t = useTranslation();
  const { user, isLoading, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState<ProfileUpdateInput>({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile(buildProfileInput(user));
  }, [user]);

  const profileValues = useMemo(
    () => (user ? buildProfileInput(user) : profile),
    [user, profile],
  );

  const handleProfileSave = async (input: ProfileUpdateInput) => {
    setIsSavingProfile(true);
    try {
      await updateProfile(input);
      notify.success(t.successMessage, t.profileSavedDescription);
    } catch (error) {
      notify.error(t.errorMessage, resolveServiceErrorMessage(error, t));
      throw error;
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarSelect = async (file: File) => {
    setIsAvatarUploading(true);
    try {
      await updateProfile({ avatar: file });
      notify.success(t.successMessage, t.profileSavedDescription);
    } catch (error) {
      notify.error(t.errorMessage, resolveServiceErrorMessage(error, t));
    } finally {
      setIsAvatarUploading(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer className="max-w-4xl">
        <LoadingState label={t.loadingMessage} />
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer className="max-w-4xl">
        <LoadingState label={t.loadingMessage} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-4xl space-y-5">
      <div data-guidance="profile-title">
        <AppBadge label={t.adminPortal} variant="brand" />
      </div>

      <ProfileHeaderCard
        user={user}
        isAvatarUploading={isAvatarUploading}
        onAvatarSelect={(file) => void handleAvatarSelect(file)}
      />

      <ProfileDetailsCard
        user={user}
        profileValues={profileValues}
        isSavingProfile={isSavingProfile}
        onSaveProfile={handleProfileSave}
        onChangePassword={changePassword}
      />
    </PageContainer>
  );
}
