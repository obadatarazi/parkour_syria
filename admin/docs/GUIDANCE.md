# In-app guidance

Dashboard-wide product tours, coach marks, checklists, tips, and feature discovery for the Admin app.

## Architecture

```text
shared/guidance/
├── configs/           # one config per page + createCrudGuidance factory
├── context/           # GuidanceProvider
├── components/        # presentational UI
├── hooks/             # useCrudPageGuidance, useGuidance
├── tours/run-tour.ts # driver.js runner
├── registry.ts        # resolve config by pathname
└── types/
```

`GuidanceProvider` mounts in `app/providers.tsx`. Help lives in `AdminHeader` (`GuidanceHelpMenu`). Floating checklist renders via `GuidanceOverlayHost`. Tip / What’s new render inline via `GuidancePageNotices` (under the page header).

## CRUD pages (default)

`createCrudGuidance` includes by default:

- Page tour
- Coach marks
- Walkthrough (Create button → side panel form)
- Form tour (auto-runs once when the create drawer opens)
- Checklist
- Contextual tip (available; not auto-shown)
- What’s new (available; not auto-shown)

Open list-page patterns from **Help** when needed. The create side panel tour runs automatically the first time you open **Add** on that page (Products, Brands, Categories, Roles, Users, etc.). Set `autoFormTourOnce: false` or `includeFormTour: false` to disable.

Drawer anchors are shared on every `AppDrawer`: `crud-form-drawer`, `crud-form-drawer-title`, `crud-form-drawer-body`.

Auto-show tip / banner only when a page has something worth surfacing on first visit:

```ts
createCrudGuidance({
  …,
  autoShowTip: true,
  autoShowFeatureDiscovery: true,
});
```

Orders uses both. Other list pages keep them Help-only.

## Add guidance to a CRUD page

1. Ensure a config exists (most list pages already use `createCrudGuidance` in `configs/guidance-configs.ts`).
2. In the page:

```tsx
import { useCrudPageGuidance } from "@/shared/guidance";

const guidance = useCrudPageGuidance("brands");

<CrudListPage {...guidance.pageProps} title={t.brands} actions={…}>
  <CrudListTable
    guidanceAnchors={{
      search: guidance.searchDataGuidance,
      filters: guidance.filtersDataGuidance,
      rowActions: guidance.rowActionsDataGuidance,
    }}
    …
  />
</CrudListPage>
```

Anchors are standardized: `{pageId}-title|search|filters|add|row-actions`.

## Rich page (Orders pattern)

- Extend `ordersGuidanceConfig` with checklist, hotspots, coach marks, walkthrough, tip, feature discovery.
- Call `guidance.completeChecklistItem("change-status")` from feature mutations when a task is done.
- Wrap special controls with `GuidanceHotspot` + `data-guidance` as needed.

## Special pages

Register a `PageGuidanceConfig` in `guidance-configs.ts` / `allGuidanceConfigs`, add `data-guidance` on the target elements, and open Help → Page tour.

Dashboard uses `autoProductTourOnce: true` and `autoShowTip: true`. Care Plans and Homepage CMS use `autoShowTip: true`.

New CRUD features must:

1. Add the `pageId` to `GuidancePageId`.
2. Register `createCrudGuidance` (or a richer config) in `allGuidanceConfigs`.
3. Call `useCrudPageGuidance` on the list page and pass `guidanceAnchors`.
4. For workspace create pages, call `useCreateFormTour(true, mode)` (Care Plans, Products, Coupons). Overlay drawers already run this via `CrudEntityDrawer`.

```text
Care Plans          /admin/care-plans          list + workspace form tour + view lifecycle
Trending searches   /admin/trending-searches   standard overlay CRUD
Homepage CMS        /admin/homepage            tabs + embedded slider lists (shared drawer tour)
```

## Help menu

On any admin page: **Help** → Page tour / Coach marks / Walkthrough / Checklist / What’s new (items appear only when the current route defines that pattern).

## Design system

Design System → **guidance** tab hosts the pattern playground dock (`GuidanceDemoDock`).

## Storage

Namespaced localStorage: `aroma-guidance:v1:{pageId}` for seen tours, checklist, dismissals, and overlay flags.
