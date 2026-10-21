import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { type ReactNode } from "react";
import { Link } from "react-router";

import { AdminCommandSearch } from "@/app/layouts/AdminCommandSearch";
import { ROUTES } from "@/app/router/routes";
import { LanguageSwitcher } from "@/shared/design-system/components/LanguageSwitcher";
import { Button } from "@/shared/design-system/components/ui/button";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { GuidanceHelpMenu } from "@/shared/guidance/components/GuidanceHelpMenu";

type AdminHeaderProps = {
  title: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  userMenu?: ReactNode;
  className?: string;
};

function ChevronForward({ isRTL, className }: { isRTL: boolean; className?: string }) {
  const Icon = isRTL ? ChevronLeft : ChevronRight;
  return <Icon className={className} aria-hidden="true" />;
}

export function AdminHeader({
  title,
  onMenuClick,
  showMenuButton = false,
  userMenu,
  className,
}: AdminHeaderProps) {
  const t = useTranslation();
  const { direction } = useLocalization();
  const isRTL = direction === "rtl";

  return (
    <header
      className={cn(
        "z-20 flex h-16 flex-none items-center gap-4 border-b border-border bg-card px-4 sm:px-6",
        className,
      )}
    >
      {showMenuButton ? (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-xl"
          onClick={onMenuClick}
          aria-label={t.openMenu}
        >
          <Menu className="size-5" />
        </Button>
      ) : null}

      <div className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link
          to={ROUTES.admin.root}
          className="font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {t.adminPanel}
        </Link>
        <ChevronForward isRTL={isRTL} className="size-3.5 shrink-0 text-border" />
        <span className="truncate font-semibold text-foreground">{title}</span>
      </div>

      <AdminCommandSearch
        actions={
          <>
            <LanguageSwitcher variant="minimal" showText={false} />

            <GuidanceHelpMenu />

            {userMenu}
          </>
        }
      />
    </header>
  );
}
