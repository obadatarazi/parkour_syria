# Parkour Syria — Admin Dashboard

React admin for the Parkour Syria site, talking to `../backend` (Laravel, Passport). Copied from the
Aroma Care admin and reshaped for Phase 1. Arabic is the default UI language; English stays available.

## Run

```bash
cp .env.example .env     # VITE_API_URL=/api, Vite proxies /api → http://localhost:8000
npm install
npm run dev
```

Start the backend with `php artisan serve` and seed it (`SEED_SUPER_ADMIN_EMAIL`, `SEED_SUPERVISOR_EMAIL`
in `backend/.env`).

## Phase 1 modules

| Nav | Route | Permission |
|---|---|---|
| Overview | `/admin` | signed in |
| Homepage slider | `/admin/homepage` | `MANAGE_SLIDER` |
| Pages / Book | `/admin/pages`, `/admin/book` | `MANAGE_PAGE` |
| Lessons | `/admin/lessons` | `MANAGE_LESSON` |
| Gallery | `/admin/gallery-images` | `MANAGE_GALLERY_IMAGE` |
| Suggestions | `/admin/suggestions` | `MANAGE_SUGGESTION` |
| Directory | `/admin/directory-entries` | `MANAGE_DIRECTORY_ENTRY` |
| Events | `/admin/events` | `MANAGE_EVENT` |
| Areas | `/admin/areas` | `MANAGE_AREA` |
| Blog posts / categories | `/admin/blog-posts`, `/admin/blog-categories` | `MANAGE_BLOG_POST`, `MANAGE_BLOG_CATEGORY` |
| Settings, users, roles | `/admin/settings`, `/admin/users`, `/admin/roles` | SuperAdmin only |

The Supervisor role holds only the content permissions, so settings, users and roles are hidden from
its nav and refused by `ProtectedRoute`.

## Feature flags

- `VITE_FEATURE_ECOMMERCE` — the dormant shop (products, brands, orders, …). Off by default; keep it in
  step with the backend `FEATURE_ECOMMERCE`.
- `VITE_FEATURE_PUBLIC_EN_LOCALE` — whether the public site's English is live. The dashboard itself
  always offers both languages.

Aroma's pharmacy-only features (care plans, prescriptions, loyalty, WhatsApp templates, payment
providers, notifications, reports, …) are still in `src/features` but are not routed. Delete them when
you no longer want them as reference.

## Adding a feature

Follow `../.cursor/rules/admin-crud-feature.mdc`. Clone `features/areas` (thin), `features/lessons`
(image) or `features/directory-entries` (pickers and filters).

## Source layout

```text
src/
├── app/                 # Shell, routing, providers, navigation, layouts
├── features/            # Feature modules
├── shared/
│   ├── components/      # Reusable UI (LocaleFieldsTabs, ImageField, …)
│   ├── constants/       # permissions.ts, routePermissions.ts, …
│   ├── crud/            # CRUD kit (CrudListPage, CrudDirtyFormDrawer, useEntityCrudMutations, …)
│   ├── design-system/   # shadcn primitives, localization (parkour.en.ts / parkour.ar.ts)
│   └── lib/             # apiRequest, env, locale-fields utils
└── main.tsx
```
