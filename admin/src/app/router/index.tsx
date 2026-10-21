import { createBrowserRouter } from "react-router";

import { RouteErrorFallback } from "@/app/components/RouteErrorFallback";
import { NotFoundPage } from "@/app/pages/NotFoundPage";
import { AppProviders } from "@/app/providers";
import { protectedRoutes } from "@/app/router/protected.routes";
import { publicRoutes } from "@/app/router/public.routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppProviders />,
    errorElement: <RouteErrorFallback />,
    children: [
      ...publicRoutes,
      ...protectedRoutes,
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
