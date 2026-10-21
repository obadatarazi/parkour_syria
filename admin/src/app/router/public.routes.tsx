import { Navigate, type RouteObject } from "react-router";

import { RouteSuspense } from "@/app/components/RouteSuspense";
import { NotAuthorizedPage } from "@/app/pages/NotAuthorizedPage";
import { ProtectedRoute } from "@/app/router/guards/ProtectedRoute";
import { PublicRoute } from "@/app/router/guards/PublicRoute";
import { LazyLoginPage } from "@/app/router/lazy-pages";
import { ROUTES } from "@/app/router/routes";

export const publicRoutes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to={ROUTES.admin.root} replace />,
  },
  {
    path: "login",
    element: (
      <PublicRoute>
        <RouteSuspense fullScreen>
          <LazyLoginPage />
        </RouteSuspense>
      </PublicRoute>
    ),
  },
  {
    path: "not-authorized",
    element: (
      <ProtectedRoute>
        <RouteSuspense>
          <NotAuthorizedPage />
        </RouteSuspense>
      </ProtectedRoute>
    ),
  },
];
