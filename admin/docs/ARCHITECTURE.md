# Admin Dashboard Architecture

This document defines the long-term architecture for the admin application.

## Layer model

```text
app
  ↓
features
  ↓
shared
```

| Layer       | Responsibility                                             | May import from                   |
| ----------- | ---------------------------------------------------------- | --------------------------------- |
| `app/`      | Routing, providers, app shell, app-only config and layouts | `features` (public API), `shared` |
| `features/` | Business capabilities (auth, dashboard, users, …)          | `shared`, same-feature internals  |
| `shared/`   | Reusable UI, CRUD infra, design system, utilities          | `shared` only                     |

## Dependency rules

1. **Shared never imports features or app.**
2. **App imports features through their public `index.ts` only.**
3. **Features do not import other feature internals.** Cross-feature access must go through a feature public API when needed.
4. **Pages and components never import mocks.** Only services import mock data.
5. **Hooks orchestrate behavior.** They call services; they do not render business-specific markup when avoidable.
6. **Services own data access.** They are the only layer that knows whether data comes from mocks or APIs.

These rules are enforced with ESLint (`npm run lint`).

## Folder responsibilities

### `src/app/`

- `App.tsx`, `providers.tsx`
- `components/` — error boundary, route suspense
- `config/` — app-specific configuration (navigation)
- `layouts/` — admin shell layouts (sidebar, header, dashboard layout)
- `pages/` — app-level pages (NotFound)
- `router/` — route definitions, guards, lazy pages

### `src/features/<name>/`

Each feature is self-contained and follows a standard structure:

```text
features/<name>/
  components/     # Feature UI
  constants/      # Feature-specific constants only
  hooks/          # Orchestration
  mocks/          # Mock data (services only)
  pages/          # Route entry points
  providers/      # Feature context when needed
  services/       # Data access + service interfaces
  types/          # Domain types
  utils/          # Feature-specific helpers
  index.ts        # Public API
```

Minimal features (e.g. `placeholder`) may omit `hooks/`, `services/`, or `mocks/` when not needed. All other folders should exist or be added when the feature grows.

### `src/shared/`

| Path | Responsibility |
| ---- | -------------- |
| `components/` | Generic UI wrappers (`AppButton`, `DataTable`, forms, layout) |
| `constants/` | Cross-feature constants (pagination, limits, files, dates) |
| `crud/` | Reusable list/form infrastructure |
| `design-system/` | shadcn primitives, theme tokens, localization |
| `errors/` | `ServiceError`, error mapping, error utilities |
| `layouts/` | Generic layouts (e.g. `AuthLayout`) |
| `lib/` | Cross-cutting utilities (`notify`, `env`, `mock`) |
| `types/` | Generic TypeScript types |
| `validation/` | Reusable validation helpers and types |

## Data flow

```text
Page → Hook → Service → Mock | API
```

Components receive data and callbacks from hooks or parents. They do not call services directly.

## Cross-cutting infrastructure

### Notifications

Use `notify` from `@/shared/lib/notifications` — never import Sonner directly in features.

```typescript
import { notify } from "@/shared/lib/notifications";

notify.success(t.saved);
notify.error(t.errorMessage, description);
notify.validation(t.required);
```

### Errors

Services throw `ServiceError` from `@/shared/errors`. Hooks map errors to user-facing copy:

```typescript
import { isServiceError, mapServiceErrorToMessageKey } from "@/shared/errors";

const messageKey = mapServiceErrorToMessageKey(error);
```

### Validation

Client-side validation uses `@/shared/validation`:

```typescript
import { validateRequired, validateEmail, isValidEmail } from "@/shared/validation";
```

Feature-specific rules stay in `features/<name>/utils/`.

### Constants

- **Shared** (`@/shared/constants`) — pagination defaults, file limits, date formats, query param names.
- **Feature** (`features/<name>/constants/`) — domain-specific values only.
- **App routes** (`app/router/routes.ts`) — application path definitions.

## Public APIs

Each feature exports only what other layers need:

```typescript
// features/auth/index.ts
export { AuthProvider, useAuth } from "...";
export { LoginPage } from "...";
export { UserMenu } from "...";
```

External consumers (`app/`, other features) must import from `@/features/<name>`.

## Import conventions

- Use the `@/` alias for all imports.
- Order imports: external packages → `@/app` → `@/features` → `@/shared` → relative.
- Prefer `import type` for type-only imports.
- Prefer barrel exports: `@/shared/components`, `@/shared/lib`, `@/shared/errors`, `@/shared/validation`, `@/shared/constants`, `@/shared/types`.
- Avoid deep paths like `@/shared/components/forms/TextField` in features and app code.

## Naming

| Item           | Convention                         | Example                 |
| -------------- | ---------------------------------- | ----------------------- |
| Feature folder | lowercase, plural when appropriate | `users`, `auth`         |
| Components     | PascalCase                         | `LoginForm.tsx`         |
| Hooks          | camelCase with `use` prefix        | `use-login.ts`          |
| Services       | `*.service.ts`                     | `auth.service.ts`       |
| Service types  | `*.service.types.ts`               | `auth.service.types.ts` |
| Mocks          | `*.mocks.ts`                       | `auth.mocks.ts`         |
| Types          | `*.types.ts`                       | `auth.types.ts`         |

## UI conventions

- [UI components](./UI_COMPONENTS.md) — reusable building blocks
- [Loading conventions](./LOADING_CONVENTIONS.md) — when to use each loading pattern
- [Empty state conventions](./EMPTY_STATE_CONVENTIONS.md) — CRUD and generic empty states

## Mock data strategy

See [MOCK_DATA.md](./MOCK_DATA.md).

## Adding a new feature

See [FEATURE_TEMPLATE.md](./FEATURE_TEMPLATE.md).

## Routing

See [ROUTING.md](./ROUTING.md).

## Package extraction

See [PACKAGE_EXTRACTION.md](./PACKAGE_EXTRACTION.md).
