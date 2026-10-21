import { type ReactNode } from "react";
import { Outlet } from "react-router";

import {
  APP_VERSION_LABEL,
  CUPCODING_LOGO_LIGHT_SRC,
  CUPCODING_NAME,
  CUPCODING_URL,
} from "@/shared/constants/app";
import { LanguageSwitcher } from "@/shared/design-system/components/LanguageSwitcher";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type AuthLayoutProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
};

function BrandPanel({ className }: { className?: string }) {
  const t = useTranslation();
  const logoSrc = "/parkour-logo.svg";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-brand text-brand-foreground",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[repeating-linear-gradient(-32deg,transparent,transparent_28px,rgba(255,255,255,0.35)_28px,rgba(255,255,255,0.35)_56px)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -start-24 -top-24 size-80 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -end-16 -bottom-32 size-96 rounded-full bg-black/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-md px-12 text-center">
        <span className="mb-6 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/90 uppercase">
          {t.adminPortal}
        </span>
        <img
          src={logoSrc}
          alt={t.parkourBrand}
          width={200}
          height={56}
          className="mx-auto mb-6 h-14 w-auto object-contain"
        />
        <p className="text-lg font-medium tracking-wide text-white/90">{t.authBrandTagline}</p>
      </div>
    </div>
  );
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const t = useTranslation();
  const mobileLogoSrc = "/parkour-logo.svg";

  return (
    <div className="flex min-h-screen bg-card">
      <BrandPanel className="hidden lg:flex lg:w-1/2" />

      <div className="relative flex min-h-screen flex-1 flex-col">
        <div className="relative overflow-hidden bg-brand px-6 py-8 text-center lg:hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15] bg-[repeating-linear-gradient(-32deg,transparent,transparent_20px,rgba(255,255,255,0.35)_20px,rgba(255,255,255,0.35)_40px)]"
            aria-hidden="true"
          />
          <span className="relative mb-3 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/90 uppercase">
            {t.adminPortal}
          </span>
          <img
            src={mobileLogoSrc}
            alt={t.parkourBrand}
            width={160}
            height={40}
            className="relative mx-auto h-10 w-auto object-contain"
          />
        </div>

        <div className="absolute end-4 top-4 z-10 hidden lg:block lg:end-5 lg:top-5">
          <LanguageSwitcher variant="minimal" showText={false} />
        </div>

        <div className="flex justify-end px-4 pt-3 lg:hidden">
          <LanguageSwitcher variant="minimal" showText={false} />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-6 sm:px-10 sm:py-10">
          <div className="w-full max-w-[420px]">
            {title ? (
              <h1 className="mb-2 text-center text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mb-8 text-center text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
            {children ?? <Outlet />}
          </div>
        </div>

        <footer className="space-y-2 px-6 pb-8 text-center text-sm text-muted-foreground">
          <a
            href={CUPCODING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-col items-center gap-1.5 transition-opacity opacity-60 hover:opacity-50"
            aria-label={`${t.poweredByLabel} ${CUPCODING_NAME}`}
          >
            <span className="text-xs text-muted-foreground">{t.poweredByLabel}</span>
            <img
              src={CUPCODING_LOGO_LIGHT_SRC}
              alt={CUPCODING_NAME}
              width={140}
              height={24}
              className="h-5 w-auto object-contain sm:h-6"
            />
          </a>
          <p className="text-xs text-muted-foreground/80">{APP_VERSION_LABEL}</p>
        </footer>
      </div>
    </div>
  );
}
