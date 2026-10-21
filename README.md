# Parkour Syria

Monorepo for the Parkour Syria platform: the public website, the admin dashboard that edits its
content, and the Laravel API behind the dashboard. Arabic is the default language everywhere;
English is built in and switched on per feature flag.

| Folder | App | Stack | Docs |
|--------|-----|-------|------|
| [`website/`](website/) | Public site | React 19, Vite 8, Tailwind 3, three.js | [website/README.md](website/README.md) |
| [`admin/`](admin/) | Admin dashboard | React 18, Vite 6, Tailwind 4, shadcn, CASL | [admin/README.md](admin/README.md) |
| [`backend/`](backend/) | JSON API | Laravel 13, PHP 8.3, MySQL, Passport | [backend/README.md](backend/README.md) |

```text
website  ── reads its own content (src/locales, src/data) for now; the public API is ready for it
admin    ── /api/admin/*  ──►  backend  ──►  MySQL
```

## Prerequisites

- Node 24 (`website/.nvmrc`) and npm
- PHP 8.3, Composer
- MySQL, running before the backend or its tests (`brew services start mysql` on macOS)

## Quick start

Each app installs and runs on its own; there is no root `package.json`.

**Backend** (first time: see [backend/README.md](backend/README.md) for keys, database and content):

```bash
cd backend
php artisan serve            # http://localhost:8000, API docs at /api/doc
```

**Admin dashboard** (Vite proxies `/api` to the backend on port 8000):

```bash
cd admin
cp .env.example .env
npm install
npm run dev
```

**Public website:**

```bash
cd website
npm install
npm run dev
```

Both front ends default to Vite's port 5173; whichever starts second moves to the next free port.

## Common scripts

| | website | admin | backend |
|---|---|---|---|
| Dev server | `npm run dev` | `npm run dev` | `php artisan serve` |
| Build | `npm run build` | `npm run build` | — |
| Lint | `npm run lint` | `npm run lint` | `./vendor/bin/pint` |
| Type check | `npm run typecheck` | `npm run typecheck` | — |
| Tests | — | `npm test` | `./vendor/bin/pest` |

## Deployment

- **website**: `npm run build` outputs `website/dist`, built for the `/parkour/` base path
  (served at `cupcoding.com/parkour/`; `public/.htaccess` handles SPA routing).
- **admin**: `npm run build` outputs `admin/dist`; set `VITE_API_URL` to the production API first.
- **backend**: a standard Laravel deploy; see the backend README for the database, Passport keys
  and content import.

## Branches

All work goes on `main`. `dev` is kept and fast-forwarded to `main` so it never lags behind.
