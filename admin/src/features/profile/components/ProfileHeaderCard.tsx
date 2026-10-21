import { Camera, Check } from "lucide-react";
import { type ChangeEvent,useRef } from "react";

import type { AuthUser } from "@/features/auth/types/auth.types";
import {
  formatMemberSince,
} from "@/features/profile/utils/profile-display.utils";
import { AppBadge, MediaImage, StatusBadge, UserAvatar } from "@/shared/components";
import { AppCard } from "@/shared/components/layout/AppCard";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useLocalization, useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ProfileHeaderCardProps = {
  user: AuthUser;
  isAvatarUploading?: boolean;
  onAvatarSelect?: (file: File) => void;
};

export function ProfileHeaderCard({
  user,
  isAvatarUploading = false,
  onAvatarSelect,
}: ProfileHeaderCardProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const memberSince = formatMemberSince(user.createdAt, language);
  const isVerified = Boolean(user.verifiedAt);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      onAvatarSelect?.(file);
    }
  };

  return (
    <AppCard padding="none" className="overflow-hidden">
      <div className="h-28 bg-gradient-to-r from-brand via-brand/80 to-brand/50 rtl:bg-gradient-to-l sm:h-32" />

      <div className="relative px-5 pb-6 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
          <div className="relative -mt-12 shrink-0 sm:-mt-14">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isAvatarUploading || !onAvatarSelect}
              onChange={handleAvatarChange}
            />

            <button
              type="button"
              disabled={isAvatarUploading || !onAvatarSelect}
              onClick={() => fileInputRef.current?.click()}
              aria-label={t.editProfile}
              className={cn(
                "group relative size-24 overflow-hidden rounded-full border-4 border-card bg-card shadow-md sm:size-28",
                onAvatarSelect ? "cursor-pointer" : "cursor-default",
              )}
            >
              {user.avatarFileUrl ? (
                <MediaImage
                  src={user.avatarFileUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <UserAvatar
                  name={user.name}
                  className="size-full rounded-full text-3xl sm:text-4xl"
                />
              )}

              {onAvatarSelect ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 text-white transition-opacity",
                    isAvatarUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                  )}
                >
                  <Camera className="size-5" />
                </span>
              ) : null}
            </button>

            {onAvatarSelect ? (
              <span className="absolute end-1 bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-card bg-foreground text-background shadow-sm">
                <Camera className="size-3.5" aria-hidden />
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 space-y-3 text-center sm:pb-1 sm:text-start">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">{user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <AppBadge label={user.role} variant="neutral" />
              <StatusBadge
                label={user.active === false ? t.inactive : t.active}
                variant={user.active === false ? "neutral" : "success"}
              />
              {isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success-muted px-2.5 py-0.5 text-xs font-semibold text-success">
                  <Check className="size-3.5" aria-hidden />
                  {t.verified}
                </span>
              ) : null}
            </div>

            {memberSince ? (
              <p className="text-xs text-muted-foreground">
                {t.memberSince} {memberSince}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </AppCard>
  );
}
