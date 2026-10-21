import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { canAccessAnyRoute, canAccessRoute, useAbility, useAuth } from "@/features/auth";
import { LoadingState } from "@/shared/components";
import { resolveRoutePermission } from "@/shared/constants/routePermissions";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const ability = useAbility();
  const location = useLocation();
  const t = useTranslation();

  if (isLoading) {
    return <LoadingState label={t.loadingMessage} className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  const requiredPermission = resolveRoutePermission(location.pathname);
  if (requiredPermission) {
    const canAccess = Array.isArray(requiredPermission)
      ? canAccessAnyRoute(ability, requiredPermission)
      : canAccessRoute(ability, requiredPermission);

    if (!canAccess) {
      return <Navigate to={ROUTES.notAuthorized} replace />;
    }
  }

  return children;
}
