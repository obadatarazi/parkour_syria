# Parkour Syria — Public Website

The visitor-facing site: a React 19 + Vite single-page app in Arabic (RTL), with English
translations ready. It is built for the `/parkour/` base path.

## Run

```bash
nvm use        # Node 24
npm install
npm run dev
```

| Script | Does |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | production build into `dist/` |
| `npm run preview` | serve the built `dist/` |
| `npm run lint` | ESLint, including i18next checks for hard-coded text |
| `npm run typecheck` | TypeScript, no emit |

## Content

The site currently reads its content from the repo, not the API:

- `src/locales/ar.json`, `src/locales/en.json`: UI text and page copy
- `src/data/demo.ts`: slides, lessons, directory, events, blog posts, gallery
- `src/config/site.ts`: contact details and links

The same content is loaded into the backend by `backend/database/sql/parkour_content.sql`, and the
public endpoints under `/api/*` (see `backend/README.md`) are ready for the site to switch over.

The page title and meta tags in `index.html` are filled at build time from `src/locales/ar.json`
(see `vite.config.ts`).

## Source layout

```text
src/
├── components/   # Header, Footer, HeroSlider, cards, effects (LiquidImage, ParallaxImage, …)
├── config/       # site.ts
├── data/         # demo content
├── i18n/         # provider, config, useI18n
├── lib/          # liquid shader, photo helpers
├── locales/      # ar.json, en.json
├── pages/        # one file per route
└── App.tsx
```

## Deploy

`npm run build`, then upload `dist/` to the `/parkour/` folder of the host. `public/.htaccess`
sends unknown paths to `index.html` so client-side routes load directly.
