import { ChevronDown, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { useAuth } from "@/features/auth";
import { CaptionText, CardTitleText } from "@/shared/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/design-system/components/ui/avatar";
import { Button } from "@/shared/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/design-system/components/ui/dropdown-menu";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveMediaUrl } from "@/shared/lib/resolve-media-url";

export function UserMenu() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "A";
  const avatarSrc = resolveMediaUrl(user?.avatarFileUrl);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto gap-2 rounded-xl px-2 py-1.5"
          aria-label={t.account}
        >
          <Avatar className="size-8 border border-border/50">
            <AvatarImage src={avatarSrc ?? undefined} alt={user?.name ?? "Admin"} />
            <AvatarFallback className="bg-brand text-sm font-black text-brand-foreground">
              {initials.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-start sm:block">
            <p className="text-xs leading-none font-bold text-foreground">{user?.name ?? "Admin"}</p>
            <CaptionText className="mt-0.5 text-[10px]">{user?.role ?? t.superAdmin}</CaptionText>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 overflow-hidden rounded-2xl p-0 shadow-2xl">
        <DropdownMenuLabel className="border-b border-border/60 px-3.5 py-3.5 font-normal">
          <CardTitleText className="text-sm">{user?.name ?? "Admin User"}</CardTitleText>
          <CaptionText className="truncate">{user?.email ?? ""}</CaptionText>
        </DropdownMenuLabel>
        <DropdownMenuItem
          className="gap-3 px-4 py-2.5"
          onClick={() => navigate(ROUTES.admin.profile)}
        >
          <User className="size-4 text-muted-foreground" />
          {t.myProfile}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem
          variant="destructive"
          className="gap-3 px-4 py-2.5"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          {t.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
