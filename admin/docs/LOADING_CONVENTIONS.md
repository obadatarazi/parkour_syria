# Loading Conventions

Standard patterns for loading states across the Admin application. No visual changes — these conventions ensure consistency when building new features.

## Loading levels

| Level | When to use | Component / pattern |
| ----- | ----------- | ------------------- |
| **Page** | Initial route or full-page data fetch | `LoadingState` with `className="min-h-screen"` or page skeleton |
| **Section** | A page section waiting on data | `LoadingState` (default `variant="section"`) |
| **Table** | List data refetch while keeping layout | `DataTable` `isLoading` prop → `TableSkeleton` |
| **Table overlay** | Refetch over existing rows | `CrudLoadingOverlay` wrapping the table |
| **Button** | Form submit or short async action | `AppButton` `isLoading` + `loadingText` |
| **Dialog** | Save/delete inside a modal | `AppDialog` / `ConfirmDialog` `isLoading`; disables actions |
| **Route lazy load** | Code-split page loading | `RouteSuspense` → `LoadingState` |

## Hook conventions

| Hook / state | Loading signal | Use for |
| ------------ | -------------- | ------- |
| `useCrudQuery` | `isLoading` | List/detail fetches |
| `useCrudMutation` | `isPending` | Create/update/delete |
| Feature hooks | `isLoading` | Page-level data (e.g. `useDashboard`) |
| Auth | `isLoading` | Session restore / login (route guards) |

## Rules

1. **One primary loader per viewport** — avoid stacking multiple full-page spinners.
2. **Prefer skeletons for layout-heavy pages** — e.g. `StatCardSkeleton` + `LoadingState` on dashboard.
3. **Button loading for mutations** — disable the triggering control; do not add a second page loader for the same action.
4. **Table refetch** — use `isLoading` on `DataTable` or `CrudLoadingOverlay`; keep toolbar/filters visible.
5. **Always provide a label** — pass translated `label` / `loadingText` for screen readers.
6. **Error replaces loading** — when fetch fails, show `ErrorState` with retry; do not leave a spinner visible.

## Examples

### Page loading

```tsx
if (isLoading) {
  return (
    <PageContainer>
      <PageHeader title={t.title} />
      <LoadingState label={t.loadingMessage} />
    </PageContainer>
  );
}
```

### Table loading

```tsx
<DataTable columns={columns} data={items} isLoading={isLoading} ... />
```

### Mutation button

```tsx
<AppButton type="submit" isLoading={isPending} loadingText={t.saving}>
  {t.save}
</AppButton>
```

### Route guard

```tsx
if (isLoading) {
  return <LoadingState label={t.loadingMessage} className="min-h-screen" />;
}
```
