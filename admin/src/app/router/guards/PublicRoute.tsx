import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { useAuth } from "@/features/auth";
import { LoadingState } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  resolveReturnPath,
  type ReturnLocationState,
} from "@/shared/lib/routing/return-path.utils";

type PublicRouteProps = {
  children: ReactNode;
};

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const t = useTranslation();

  if (isLoading) {
    return <LoadingState label={t.loadingMessage} className="min-h-screen" />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={resolveReturnPath(
          (location.state as ReturnLocationState | null) ?? null,
          ROUTES.admin.root,
        )}
        replace
      />
    );
  }

  return children;
}
