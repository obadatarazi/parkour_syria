# Routing

The admin application uses React Router v7 with a modular route configuration.

## Structure

```text
app/router/
  routes.ts           # Route path constants
  lazy-pages.ts       # Code-split page imports
  public.routes.tsx   # Unauthenticated routes
  protected.routes.tsx # Authenticated admin routes
  guards/
    ProtectedRoute.tsx
    PublicRoute.tsx
  index.tsx           # createBrowserRouter entry
```

## Route constants

Always use `ROUTES` from `@/app/router/routes` inside the app layer:

```typescript
import { ROUTES } from "@/app/router/routes";

ROUTES.login; // "/login"
ROUTES.admin.orders; // "/admin/orders"
```

Navigation config (`app/config/navigation.ts`) imports `ROUTES` to keep sidebar links in sync.

Features should not import router modules. Use feature constants (e.g. `AUTH_POST_LOGIN_PATH`) when navigation is required from a feature hook.

## Lazy loading

All feature pages are lazy-loaded via `lazy-pages.ts` and wrapped with `RouteSuspense` for consistent loading UI.

## Guards

| Guard            | Purpose                                       |
| ---------------- | --------------------------------------------- |
| `PublicRoute`    | Redirects authenticated users away from login |
| `ProtectedRoute` | Redirects unauthenticated users to login      |

## Error handling

| Component            | Scope                                        |
| -------------------- | -------------------------------------------- |
| `AppErrorBoundary`   | Catches unhandled React render errors        |
| `RouteErrorFallback` | React Router `errorElement` for route errors |
| `NotFoundPage`       | Unknown paths (`path: "*"`)                  |

## Adding a new route

1. Add path to `ROUTES` in `routes.ts`.
2. Add lazy import in `lazy-pages.ts`.
3. Register route in `protected.routes.tsx` or `public.routes.tsx`.
4. Update `app/config/navigation.ts` if the route appears in the sidebar.
