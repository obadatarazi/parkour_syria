# Empty State Conventions

When and how to show empty states in the Admin application.

## Components

| Component | Use |
| --------- | --- |
| `EmptyState` | Generic empty UI — pass `title`, `description`, optional `action` and `icon` |
| `CrudEmptyState` | CRUD list empty states with preset icons and i18n per variant |
| `useCrudEmptyMessages` | Returns title/description for a `CrudEmptyVariant` inside custom layouts |
| `resolveCrudEmptyVariant` | Determines which CRUD variant applies from list state |

## CRUD variants

| Variant | When | Resolution |
| ------- | ---- | ---------- |
| `no-records` | Collection is empty | `totalRecords === 0` |
| `no-search-results` | Search active, zero matches | `hasSearch && filteredCount === 0` |
| `no-filter-results` | Filters active, zero matches | `hasActiveFilters && filteredCount === 0` |
| `permission-denied` | User lacks access | `isPermissionDenied === true` |
| `first-time` | Onboarding / never configured | Set explicitly when appropriate |

Use `useCrudList` — it computes `emptyVariant` via `resolveCrudEmptyVariant`.

## Non-CRUD empty states

| Scenario | Approach |
| -------- | -------- |
| **Generic empty page** | `EmptyState` with feature-specific copy via `useTranslation()` |
| **Placeholder routes** | `PlaceholderPage` pattern — `PageHeader` + `EmptyState` |
| **Offline** | `ErrorState` or `EmptyState` with network copy — use when API integration adds connectivity detection |
| **Inline empty** | `EmptyState` inside a `PageSection` or card |

## Rules

1. **Always use i18n** — no hardcoded empty copy in components.
2. **Prefer variant helpers for lists** — do not duplicate CRUD empty message logic in features.
3. **Offer a next action when possible** — e.g. "Add new" button in `action` slot.
4. **Distinguish search/filter empty from truly empty** — users should know how to recover.
5. **Permission denied is not "no data"** — use the lock icon variant; do not show create actions.

## Examples

### CRUD list (DataTable)

```tsx
const emptyMessages = useCrudEmptyMessages(emptyVariant);

<DataTable
  emptyTitle={emptyMessages?.title ?? t.noData}
  emptyDescription={emptyMessages?.description ?? t.emptyStateDefaultDescription}
  ...
/>
```

### Standalone empty section

```tsx
<EmptyState
  title={t.comingSoon}
  description={t.placeholderPageDescription}
/>
```

### Full CRUD empty component

```tsx
<CrudEmptyState variant="first-time" action={<AppButton>{t.addNew}</AppButton>} />
```
