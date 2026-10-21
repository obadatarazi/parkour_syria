# Mock Data Strategy

The admin dashboard intentionally uses mock data during early development. The architecture is designed so backend integration requires **service changes only**.

## Principles

1. **Mocks live in `features/<name>/mocks/`.**
2. **Only services import mocks.**
3. **Service interfaces define the contract** in `*.service.types.ts`.
4. **Mock implementations are created in `*.service.ts`** via factory functions.
5. **Pages, hooks, and components never branch on mock vs API.**

## Pattern

```typescript
// features/example/services/example.service.types.ts
export interface ExampleService {
  getItems(): Promise<ExampleItem[]>;
}

// features/example/mocks/example.mocks.ts
export const exampleMocks: ExampleItem[] = [
  /* ... */
];

// features/example/services/example.service.ts
import { exampleMocks } from "@/features/example/mocks/example.mocks";
import type { ExampleService } from "@/features/example/services/example.service.types";

function createMockExampleService(): ExampleService {
  return {
    async getItems() {
      return exampleMocks;
    },
  };
}

export const exampleService: ExampleService = createMockExampleService();
```

Hooks always call `exampleService`:

```typescript
// features/example/hooks/use-example-list.ts
import { exampleService } from "@/features/example/services/example.service";
```

## Future API integration

When the backend is ready:

1. Add `createApiExampleService()` in the same service file (or a sibling `example.service.api.ts`).
2. Select the implementation using `env.useMocks` from `@/shared/lib/env`.
3. Keep the `ExampleService` interface unchanged.
4. Hooks, pages, and components require no changes.

```typescript
import { env } from "@/shared/lib/env";

export const exampleService: ExampleService = env.useMocks
  ? createMockExampleService()
  : createApiExampleService();
```

## Environment variables

| Variable         | Purpose                                          |
| ---------------- | ------------------------------------------------ |
| `VITE_API_URL`   | Base URL for API requests (future)               |
| `VITE_USE_MOCKS` | When `"false"`, use API implementations (future) |

Defaults are defined in `.env.example` and typed in `src/vite-env.d.ts`.

## ESLint enforcement

- `features/**/mocks/**` cannot import services, hooks, or pages.
- `features/**/services/**` cannot import hooks, pages, or components.

This keeps mock data isolated and services as the single data boundary.
