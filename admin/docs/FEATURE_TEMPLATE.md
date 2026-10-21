# Feature Template

Use this template when adding a new feature (e.g. `users`, `orders`).

## 1. Create the folder structure

```text
src/features/<name>/
  components/
  constants/
  hooks/
  mocks/
  pages/
  services/
  types/
  utils/
  index.ts
```

| Folder | Required | Notes |
| ------ | -------- | ----- |
| `components/` | Yes | Feature UI |
| `constants/` | Yes | Feature-specific values only |
| `hooks/` | Yes* | *Omit for minimal/placeholder features |
| `mocks/` | Yes* | *Required when feature has a service |
| `pages/` | Yes | Route entry points |
| `services/` | Yes* | *Omit until feature needs data |
| `types/` | Yes | Domain models and form types |
| `utils/` | When needed | Feature-specific helpers only |
| `providers/` | Optional | Only when feature needs React context |
| `index.ts` | Yes | Public API |

## 2. Define types first

```text
features/<name>/types/<name>.types.ts
```

Domain models, request/response shapes, and form types belong here.

Use shared generic types where applicable:

```typescript
import type { FieldErrors, PaginatedResult } from "@/shared/types";

export type UserFormErrors = FieldErrors<"name" | "email">;
```

## 3. Add constants

```text
features/<name>/constants/<name>.constants.ts
```

Feature-specific values only. Use `@/shared/constants` for generic limits, pagination, and file rules.

```typescript
import { DEFAULT_PAGE_SIZE } from "@/shared/constants";

export const USERS_LIST_PAGE_SIZE = DEFAULT_PAGE_SIZE;
```

## 4. Add mock data

```text
features/<name>/mocks/<name>.mocks.ts
```

Mocks import types only. Never import services or hooks.

## 5. Define the service interface

```text
features/<name>/services/<name>.service.types.ts
```

Export an interface describing all data operations for the feature.

## 6. Implement the mock service

```text
features/<name>/services/<name>.service.ts
```

- Import mocks and the service interface.
- Throw `ServiceError` from `@/shared/errors` for expected failures.
- Export a typed singleton: `export const <name>Service: <Name>Service = createMock...()`.

```typescript
import { ServiceError } from "@/shared/errors";
import { mockDelay } from "@/shared/lib";
```

## 7. Create hooks

```text
features/<name>/hooks/use-<thing>.ts
```

Hooks call services and expose state/actions to pages and components.

Conventions:

- Use `notify` from `@/shared/lib/notifications` for user feedback.
- Use `@/shared/validation` for client-side validation.
- Use `mapServiceErrorToMessageKey` for service error messages.
- Never import mocks.

## 8. Build components and pages

- **Pages** — thin route entry points; use hooks only.
- **Components** — presentation; receive data via props or feature hooks.
- Import UI from `@/shared/components` barrel — avoid deep paths.

## 9. Export the public API

```typescript
// features/<name>/index.ts
export { UsersListPage } from "@/features/users/pages/UsersListPage";
// Export only what app/ or other features need.
```

## 10. Register routes

Add routes in `src/app/router/`. Import pages from `@/features/<name>` only.

See [ROUTING.md](./ROUTING.md).

## 11. Checklist

- [ ] Folder structure matches the standard above
- [ ] No mock imports outside `services/`
- [ ] No service imports in components or pages
- [ ] Public API exported via `index.ts`
- [ ] App imports from `@/features/<name>` only
- [ ] Cross-feature imports use public APIs only
- [ ] Types are not duplicated across features
- [ ] UI strings use `useTranslation()`
- [ ] Notifications use `notify`, not Sonner directly
- [ ] Services throw `ServiceError` for expected failures
- [ ] Shared constants used instead of magic numbers
- [ ] Loading states follow [LOADING_CONVENTIONS.md](./LOADING_CONVENTIONS.md)
- [ ] Empty states follow [EMPTY_STATE_CONVENTIONS.md](./EMPTY_STATE_CONVENTIONS.md)

## CRUD features

For list/create/edit/delete features, compose shared CRUD infrastructure from `@/shared/crud`:

- `useCrudList`, `useCrudQuery`, `useCrudMutation`
- `CrudListPage`, `CrudToolbar`, `CrudDeleteDialog`, `DataTable`, etc.

Keep feature-specific column definitions and service calls in the feature hooks.

## Validation

| Layer | Responsibility |
| ----- | -------------- |
| `@/shared/validation` | `validateRequired`, `validateEmail`, `isValidEmail`, `mergeFieldErrors` |
| Feature `utils/` | Domain-specific rules (e.g. SKU format) |
| Service | Server-side rules; throw `ServiceError` |

## Errors

```typescript
import { ServiceError, isServiceError, mapServiceErrorToMessageKey } from "@/shared/errors";

// In service
throw new ServiceError("not_found");

// In hook
catch (error) {
  if (isServiceError(error)) { ... }
  const key = mapServiceErrorToMessageKey(error);
  notify.error(t.errorMessage, t[key]);
}
```

## Notifications

```typescript
import { notify } from "@/shared/lib/notifications";

notify.success(t.saved);
notify.error(t.errorMessage, description);
notify.validation(t.fixFormErrors);
```
