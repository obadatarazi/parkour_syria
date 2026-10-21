# Parkour Syria

Monorepo for the Parkour Syria platform.

| Folder | App | Description |
|--------|-----|-------------|
| [`website/`](website/) | Public site | React (Vite) SPA — Arabic visitor site, base path `/parkour/` |
| [`admin/`](admin/) | Admin dashboard | React CMS for content |
| [`backend/`](backend/) | API | Laravel JSON API |

## Quick start — public website

```bash
cd website
npm install
npm run dev
```

Build for production (`/parkour/` assets):

```bash
cd website
npm run build
```

See each folder's README for admin and backend setup.
