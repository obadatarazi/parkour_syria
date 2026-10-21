# UI Components

Reusable UI building blocks for the Admin application. Import from `@/shared/components` unless noted.

**Constraints:** No business logic, no API calls, no feature-specific behavior. Visual identity matches the existing design system.

---

## Buttons

### `AppButton`

Primary action button with loading state.

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `"default" \| "outline" \| "ghost" \| "destructive"` | Visual style |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | Size |
| `isLoading` | `boolean` | Shows spinner, disables button |
| `loadingText` | `string` | Accessible label while loading |

```tsx
<AppButton isLoading={saving} loadingText={t.saving}>
  {t.save}
</AppButton>
```

---

## Typography

| Component | Use |
|-----------|-----|
| `PageTitle` | Page-level heading |
| `SectionTitle` | Section heading |
| `CardTitleText` | Card titles |
| `BodyText` | Body copy |
| `CaptionText` | Secondary / meta text |
| `HelperText` | Form field hints |
| `ErrorText` | Validation errors |

---

## Layout

### `PageContainer`

Max-width wrapper for page content.

### `PageHeader`

Page title, optional description, and action slot.

```tsx
<PageHeader
  title={t.users}
  description={t.usersDescription}
  actions={<AppButton>{t.addNew}</AppButton>}
/>
```

### `PageBody`

Vertical stack with consistent page spacing between sections.

### `PageSection`

Titled content block with optional actions.

### `AppCard` / `ContentCard`

Card shells with consistent padding and shadow. `ContentCard` adds a header slot.

### `Toolbar` / `ActionBar` / `ActionGroup`

Horizontal toolbars for filters, search, and grouped actions.

### `ResponsiveGrid` / `ResponsiveStack`

| Component | Props | Behavior |
|-----------|-------|----------|
| `ResponsiveGrid` | `columns` (2–4) | Responsive CSS grid |
| `ResponsiveStack` | `direction`, `gap` | Flex stack with gap tokens |

### `Divider`

Visual separator between sections.

---

## Data display

### `DataTable`

Generic table with selection, pagination, sorting, row actions, and empty state.

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `DataTableColumn<T>[]` | Column definitions |
| `data` | `T[]` | Row data |
| `enableSelection` | `boolean` | Row checkboxes |
| `selectedIds` / `onSelectionChange` | | Controlled selection |
| `bulkActions` | `ReactNode` | Shown when rows selected |
| `pagination` | `DataTablePagination` | Page controls |
| `caption` | `string` | Screen reader table caption |
| Column `sortable`, `sortDirection`, `onSort` | | Sortable headers |

```tsx
<DataTable
  columns={columns}
  data={items}
  caption={t.orders}
  enableSelection
  selectedIds={selection.selectedIds}
  onSelectionChange={selection.setSelectedIds}
  bulkActions={
    <CrudBulkActionBar
      selectedCount={selection.selectedIds.length}
      selectedLabel={t.selectedItems.replace("{count}", String(selection.selectedIds.length))}
      clearLabel={t.clearSelection}
      onClear={selection.clearSelection}
    />
  }
  pagination={{ page, pageSize, totalItems, onPageChange, previousLabel, nextLabel }}
/>
```

### `StatCard` / `MetricCard`

KPI cards with label, value, and optional trend. `MetricCard` is an alias; `StatCardGrid` / `MetricCardGrid` use `ResponsiveGrid`.

### `StatusBadge` / `AppBadge`

Semantic status chips. Pass `label` and `variant` — domain mapping stays in features.

### `InfoCard`

Highlighted info panel for summaries or callouts.

---

## Feedback

| Component | Use |
|-----------|-----|
| `EmptyState` | No data placeholder |
| `LoadingState` | Page/section loading |
| `ErrorState` | Error with optional retry action |
| `StatCardSkeleton` / `TableSkeleton` | Loading placeholders |
| `AppToaster` | Toast host (mounted in providers) |

---

## Forms

All field components share a consistent API:

| Prop | Description |
|------|-------------|
| `label` | Visible label |
| `error` | Validation message |
| `required` | Shows required indicator |
| `disabled` | Disables input |
| `helperText` | Hint below field |

### Primitives

| Component | Notes |
|-----------|-------|
| `FormField` | Base wrapper (label, error, helper, a11y ids) |
| `TextField` | Text input |
| `EmailField` | `type="email"` |
| `PasswordField` | Password with optional visibility toggle |
| `TextAreaField` | Multi-line text |
| `SearchField` | Search input with clear button |
| `CheckboxField` | Labeled checkbox |
| `SelectField` | Dropdown select |
| `DatePickerField` | Read-only placeholder until date library is added |
| `FileUploadField` | File input with drag-and-drop styling |

### Layout

| Component | Use |
|-----------|-----|
| `FormSection` | Group of related fields with title |
| `FormRow` | Horizontal field row |
| `FieldGroup` | Tight grouping without section title |
| `FormActions` | Submit / cancel button row |
| `RequiredIndicator` | Asterisk for required fields |

```tsx
<FormSection title={t.accountDetails}>
  <FormRow>
    <EmailField label={t.email} value={email} onChange={...} error={errors.email} required />
    <PasswordField label={t.password} value={password} onChange={...} required />
  </FormRow>
</FormSection>
```

---

## Overlays

### `AppDialog`

Accessible modal wrapper around Radix Dialog.

### `ConfirmDialog`

Destructive / confirmation pattern with title, description, and actions.

---

## CRUD (`@/shared/crud`)

Higher-level list/detail/form patterns built on shared components.

### Components

| Component | Purpose |
|-----------|---------|
| `CrudListPage` | Full list page shell |
| `CrudListSection` | Section wrapper (`PageSection`) |
| `CrudToolbar` | Search + actions row |
| `CrudSearchField` | Debounced search (`SearchField`) |
| `CrudFilterBar` | Filter dropdowns |
| `CrudExportMenu` | Export actions menu |
| `CrudTableActions` | Row action dropdown |
| `CrudBulkActionBar` | Selection summary + clear |
| `CrudLoadingOverlay` | Table loading overlay |
| `CrudEmptyState` | CRUD-specific empty states |
| `CrudEntityDialog` | Create/edit dialog shell |
| `CrudDeleteDialog` | Delete confirmation |
| `CrudFormShell` / `CrudFormFooter` | Form layout + actions |
| `CrudDetailPage` / `CrudDetailSection` | Read-only detail views |
| `CrudFileUpload` | File upload (`FileUploadField`) |

### Hooks

| Hook | Purpose |
|------|---------|
| `useCrudList` | Composes search, filters, pagination, selection |
| `useCrudSearch` | Debounced search state |
| `useCrudFilters` | Filter state |
| `useCrudPagination` | Page state |
| `useCrudSelection` | Row selection |
| `useCrudDialog` | Create/edit/delete dialog state |
| `useCrudMutation` | Async mutation with toast feedback |
| `useCrudEmptyMessages` | i18n empty state messages |

### Typical list feature pattern

```tsx
const { search, filters, pagination, selection, pageItems, filteredItems, emptyVariant } =
  useCrudList({ items, searchKeys, filterDefinitions });

return (
  <CrudListSection title={t.items}>
    <CrudToolbar search={<CrudSearchField ... />} actions={<CrudExportMenu />} />
    <CrudFilterBar ... />
    <DataTable ... />
  </CrudListSection>
);
```

---

## Design system primitives

Low-level shadcn/Radix components live in `@/shared/design-system/components/ui/`. Prefer `@/shared/components` wrappers for app code.

---

## Accessibility checklist

Shared components include:

- Associated labels and `aria-describedby` for errors/helpers
- `aria-invalid` on invalid fields
- Table `caption` support
- Sortable column `aria-sort`
- Focus-visible rings (theme tokens)
- Keyboard support via Radix primitives (dialogs, dropdowns, selects)

---

## Animation utilities

CSS classes in `theme.css`:

- `.ui-transition-colors` — hover/focus color transitions
- `.ui-transition-shadow` — card shadow transitions
- `.ui-transition-opacity` — fade transitions

Use sparingly; keep motion subtle.

---

## Adding a new component

1. Place in the correct `shared/components/` subfolder.
2. No imports from `app/` or `features/`.
3. Export from `shared/components/index.ts`.
4. Document props and an example in this file.
5. Reuse existing typography, spacing, and form field patterns.

---

## Developer infrastructure

These are not UI components but are part of the feature development platform:

| Module | Import | Purpose |
| ------ | ------ | ------- |
| Notifications | `@/shared/lib/notifications` | `notify.success/error/warning/info/validation` |
| Validation | `@/shared/validation` | `validateRequired`, `validateEmail`, `isValidEmail` |
| Errors | `@/shared/errors` | `ServiceError`, `mapServiceErrorToMessageKey` |
| Constants | `@/shared/constants` | Pagination, limits, files, dates |
| Types | `@/shared/types` | `AsyncStatus`, `PaginatedResult`, `FieldErrors` |

See also:

- [Loading conventions](./LOADING_CONVENTIONS.md)
- [Empty state conventions](./EMPTY_STATE_CONVENTIONS.md)
- [Feature template](./FEATURE_TEMPLATE.md)
