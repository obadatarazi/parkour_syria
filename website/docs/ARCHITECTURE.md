# Parkour public site — architecture

Scope: `website/` only (Vite + React SPA). Deployed under the `/parkour/` base path.

**Design freeze:** keep pixels, timing, and animation behavior. Prefer restoring original classes over redesign when something drifts.

---

## Folder map

```
website/src/
  app/                 # shell App, pathFor/parsePath, page map, DEV ui-kit route helper
  pages/<route>/       # one folder per route (path+lesson, directory+detail, blog+article)
  pages/ui-kit/        # DEV-only catalog (dynamic import; not in prod routes/bundle page)
  features/            # domain UI (HeroSlider, DirectoryCard, ListCard)
  components/
    layout/            # Header, Footer, LanguageToggle
    motion/            # Reveal, Parallax, Liquid, Preloader, CustomCursor
    nav/               # NavProvider, useNav, useLink
    ui/                # design-system primitives (Button, Tag, …)
  hooks/               # useDirectory, useEvents, usePosts, usePost, useLessons, …
  services/            # async API surface (demo today; fetch later)
  types/               # shared domain + PageId / NavPageId
  data/demo.ts         # neutral demo tables only (ids, images, dates)
  i18n/ + locales/     # custom i18n (ar default, en available)
  config/site.ts       # site URLs, WhatsApp helpers
  lib/                 # cn, photo, liquid
  styles/index.css     # tokens + component CSS classes
```

**Dependency direction:** `app` → `pages` → `features` → `components/ui` → `lib` / `config` / `types`.  
`components/ui` must not import `pages` or `features`. No circular imports (`npx madge --circular --extensions ts,tsx src`).

Imports use `@/` only.

---

## Routing (`/parkour/` base)

Vite `base` is `/parkour/`. Runtime root:

```ts
ROOT = import.meta.env.BASE_URL.replace(/\/$/, '') // → "/parkour"
```

| Helper | Role |
|--------|------|
| `pathFor(page, id?)` | Build in-app URL: `ROOT + path` or `ROOT + path + / + id` |
| `parsePath(pathname)` | Map URL → `{ page, id? }`. Unknown → `home` |
| `paths` / `detailOf` | List paths and which list pages own detail segments |

Detail URLs:

- `/parkour/path/:num` → `lesson`
- `/parkour/directory/:slug` → `dir-detail`
- `/parkour/blog/:slug` → `article`

Custom History API router (no React Router). `useLink()` returns `{ href, onClick }` so middle-click / copy-link work.

**DEV only:** `/parkour/ui-kit` loads via `import()` behind `import.meta.env.DEV`. Not in `paths` / production page map. Production bundle must not include the `UiKitPage` module.

---

## i18n rules

- Custom provider (`I18nProvider`); not react-i18next runtime (eslint plugin still enforces no literal strings in JSX).
- `LANG_LOCKED = true`, `SHOW_LANG_TOGGLE = false` — Arabic-only in production behavior. Do not flip without an explicit product decision.
- Default language Arabic; `dir` / `lang` on `<html>` via `applyDocumentLang`.
- Latin digits in both locales (`localeOf` uses `nu-latn`).
- All user-facing copy in `locales/ar.json` and `locales/en.json`. Prefer `t('key')` / `tm('key')`.
- Logical CSS (`ps`/`pe`, `start`/`end`, `border-inline-start`) and `.flip-rtl` for mirrored icons.
- New files must lint with **zero** warnings/errors under the i18n rules.

### Unused i18n keys (do not delete)

Kept for possible future UI; listed so they are not “lost”:

- `pages.home.directorySub`
- `pages.home.eventsSub`
- `pages.home.blogSub`
- `pages.home.verifiedNote`
- `pages.about.p1Before` (empty string; `brandStrong` + `p1After` are used)

`meta.siteTitle` / `meta.description` / `meta.ogDescription` are used by `vite.config.ts` HTML injection. All `demo.*` keys are consumed via `tm('demo')` in service mappers / hooks.

---

## How to add a page

1. Add `PageId` (and `NavPageId` if it appears in header/footer) in `src/types/navigation.ts`.
2. Add path in `src/app/paths.ts` (`paths`, and `detailOf` if it is a detail under a list).
3. Create `src/pages/<name>/<Name>Page.tsx`.
4. Register the component in `src/app/routes.ts` `pages` map (static import — **no** `React.lazy` for first-paint pages).
5. Add `meta.titles.<page>` and any `pages.*` / `nav.*` keys in **both** `ar.json` and `en.json`.
6. If linked from chrome, add to `navLinks` or Header/Footer extras.
7. Add the route to `tests/visual/routes.spec.ts` only if it should be in the visual suite; do **not** refresh baselines from current code to hide diffs.
8. Run `npm run typecheck`, `lint`, `build`, `visual:check`.

---

## How to add a component

| Kind | Where |
|------|--------|
| Generic, class-stable UI | `components/ui/` — wrap existing CSS (`.btn`, `.tag`, …); keep responsive classes identical |
| Domain card / slider | `features/<name>/` |
| Layout chrome | `components/layout/` |
| Motion / effects | `components/motion/` — do not change timing/easing/thresholds |

- Prefer `cn()` from `lib/cn.ts` (no `clsx` / `tailwind-merge` / `cva`).
- Use `ps-*` Tailwind tokens that mirror CSS variables when replacing repeated hex.
- Do not change `sm`/`md`/`lg`/`xl` prefixes, container widths, or media queries unless restoring a documented baseline regression.
- Document new primitives in `docs/COMPONENTS.md`.
- Preview in DEV at `/parkour/ui-kit` when useful.

---

## Data layer → real API (native `fetch` only)

Today services resolve demo data (no network). Hooks expose `{ data, loading, error }` with **`loading: false`** on the sync demo path so screens match the visual baseline.

### Files

- `services/client.ts` — `apiBaseUrl` from `VITE_API_URL` (see `.env.example`).
- `services/*.ts` — `getDirectory`, `getDirectoryItem`, `getEvents`, `getPosts`, `getPost`, `getLessons`, `submitSuggestion`, plus gallery/slides helpers.
- `hooks/*` — call services / mappers; pages must not import `data/demo.ts` for rendered entities.

### Replacing demo with a real API

1. Set `VITE_API_URL` (e.g. `https://api.example.com`).
2. In each service, use **native `fetch` only** — no axios, ky, or other HTTP libraries.
3. Keep return types as `Promise` of the shapes in `src/types/` (same fields pages already render).
4. Example sketch:

```ts
import { apiBaseUrl } from './client';
import type { DirectoryItem } from '@/types';

export async function getDirectory(): Promise<DirectoryItem[]> {
  const res = await fetch(`${apiBaseUrl}/directory`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`directory ${res.status}`);
  return res.json() as Promise<DirectoryItem[]>;
}
```

5. Update hooks to `useEffect` + `useState` for `{ data, loading, error }` when calls are truly async. Add loading/error UI only where product requires it; if a page previously had no spinner, flag any new empty first paint in Observations and prefer resolving data before first paint when possible.
6. Leave `data/demo.ts` + locale `demo.*` until the API is the sole source, then remove in a dedicated cleanup.
7. Re-run `visual:check` (all five widths + `menu-open@375`). Do not update baselines from current code to hide regressions.

`submitSuggestion` should `POST` JSON with `fetch` when the backend exists; today it resolves locally.

---

## Visual regression

- Script: `npm run visual:check` (`maxDiffPixelRatio: 0.001`).
- Widths: **375, 768, 1024, 1440, 1920** (14 routes) + **menu-open@375**.
- Baselines live in `tests/visual/baseline/`. New width / menu baselines were taken from Phase 0 commit `bee6195` via git worktree — **never** refresh from current code to mask a real diff.
- Determinism: skip preloader via `sessionStorage`, freeze CSS animations, neutralize ≥1s `setInterval`.

---

## Bundle sizes (vs Phase 0)

| Asset | Phase 0 | After Phase 4/5 | Δ |
|-------|---------|-----------------|---|
| CSS | 27.53 kB | 27.69 kB | +0.16 kB |
| index JS | 306.15 kB | 307.47 kB | +1.32 kB |
| liquid JS | 524.13 kB | 524.13 kB | 0 |

---

## Ship checklist

- [ ] Design frozen (no intentional visual redesign)
- [ ] `visual:check` within `maxDiffPixelRatio` 0.001 at **375 / 768 / 1024 / 1440 / 1920** and **menu-open@375**
- [ ] No hardcoded user-facing strings (eslint i18n clean)
- [ ] Pages use `components/ui` primitives where patterns exist
- [ ] `/ui-kit` not in the production page module bundle (`UiKitPage` absent from prod JS)
- [ ] `npx madge --circular --extensions ts,tsx src` — none
- [ ] Files over ~200 lines justified: `styles/index.css` (design system), `data/demo.ts` (neutral tables), `pages/home/HomePage.tsx` (home composition; split only with a real extraction)
- [ ] No `any` / `@ts-ignore` / `@ts-expect-error` in `src/`
- [ ] Bundle sizes compared to Phase 0 table above
- [ ] New/edited files lint with zero warnings

---

## Related docs

- [AUDIT.md](./AUDIT.md) — Phase 0 inventory
- [COMPONENTS.md](./COMPONENTS.md) — UI primitives reference
