# Package Extraction Readiness

This document maps current folders to future monorepo packages. No packages are created yet.

## Target structure

```text
apps/
  admin/
packages/
  ui/
  design-system/
  types/
  utils/
  api/
```

## Extraction map

| Current location                          | Future package                   | Notes                                   |
| ----------------------------------------- | -------------------------------- | --------------------------------------- |
| `shared/design-system/`                   | `packages/design-system`         | Primitives, tokens, localization core   |
| `shared/design-system/index.ts`           | Public API barrel                | Already prepared                        |
| `shared/components/`                      | `packages/ui`                    | App-agnostic UI wrappers                |
| `shared/crud/`                            | `packages/ui` or `packages/crud` | Generic CRUD infrastructure             |
| `shared/types/`                           | `packages/types`                 | `ServiceError`, `PaginatedResult`, etc. |
| `shared/lib/mock.ts`, `shared/lib/env.ts` | `packages/utils`                 | Cross-cutting utilities                 |
| `shared/lib/toast.ts`                     | `packages/ui`                    | Tied to sonner + design tokens          |
| `app/`                                    | `apps/admin`                     | App shell stays in application          |
| `features/`                               | `apps/admin/src/features`        | Business features stay in app           |
| `app/layouts/`, `app/config/`             | `apps/admin`                     | Admin-specific shell                    |

## Coupling to resolve before extraction

| Item            | Current state                | Action before extraction             |
| --------------- | ---------------------------- | ------------------------------------ |
| Localization    | Monolithic `en.ts` / `ar.ts` | Split admin vs website namespaces    |
| `AuthLayout`    | In `shared/layouts`          | Keep in ui package as generic layout |
| Admin layouts   | In `app/layouts`             | Stay in admin app                    |
| `@/` path alias | Single app alias             | Replace with package names           |

## Prepared conventions

- **Barrel exports** — `shared/components/index.ts`, `shared/crud/index.ts`, `shared/design-system/index.ts`
- **Service interfaces** — `*.service.types.ts` per feature for API swap
- **Mock factories** — `createMock*Service()` pattern in services
- **Route constants** — isolated in `app/router/routes.ts`

## Intentionally not extracted yet

- Feature modules (`auth`, `dashboard`, …)
- App router and guards
- Admin navigation configuration
- Notification placeholder data
