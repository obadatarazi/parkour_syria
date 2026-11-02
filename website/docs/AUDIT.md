# Parkour public site — Phase 0 audit

**Date:** 2026-10-21  
**Branch:** `refactor/architecture`  
**Scope:** `website/` only. No production `src/` edits in Phase 0.

---

## 1. Current folder structure

```
website/src/
  App.tsx                 # route map + shell
  main.tsx                # I18nProvider wrap
  index.css               # tokens + all design-system CSS (~434 lines)
  components/             # shell + motion + feature cards + router (mixed)
    nav.tsx, Header, Footer, HeroSlider, DirectoryCard, ListCard,
    Reveal, ParallaxImage, LiquidImage, Preloader, CustomCursor, LanguageToggle
  pages/                  # 14 flat page files (no per-page folders)
  data/demo.ts, useDemo.ts
  i18n/, locales/
  config/site.ts
  lib/liquid.ts, photo.ts
```

### What’s wrong for scale

| Issue | Why it hurts |
|-------|----------------|
| Flat `pages/` | No co-location of page-only pieces; Home already ~197 lines |
| `components/` mixes layout, motion, features, and router | Hard to know where a new card or slider belongs |
| Pages import `useDemo()` / demo shapes directly | Future API swap will touch every page |
| Route map lives in both `nav.tsx` (`paths`) and `App.tsx` (`pages`) | Two places to update when adding a route |
| `index.css` is the entire design system | Tokens and component classes are not discoverable as named UI |
| `tailwind.config.js` `theme.extend` is empty | Magic colors/spacing live only in CSS or one-off Tailwind literals (`bg-[#0a0a0a]`) |
| No `types/`, `services/`, `hooks/` | Not ready for a typed API layer |

---

## 2. Repeated UI patterns (files)

| Pattern | CSS / classes | Appears in |
|---------|----------------|------------|
| Button dark | `.btn.btn-dark` (+ `.btn-sm` / `.btn-lg` / `.btn-block`) | HomePage, HeroSlider, DirectoryCard, DirDetailPage, EventsPage, AboutPage, LessonPage, SuggestPage |
| Button outline | `.btn.btn-outline` | HomePage, HeroSlider, DirectoryCard, DirDetailPage, LessonPage |
| Button accent | `.btn.btn-accent` (+ lg / block) | HomePage, BookPage |
| Tag / verified | `.tag`, `.tag-verified` | DirectoryCard, DirDetailPage, ArticlePage |
| Section eyebrow + title | `.section-label`, `.section-title` | HomePage (many), Footer headings use similar tracking utilities |
| Page hero | `.page-hero` | What, Path, Directory, Events, Suggest, Blog, Book, About, Contact, Disclaimer |
| Filter chip | `.filter-btn` (+ `.active`) | DirectoryPage, BlogPage; LanguageToggle reuses `.filter-btn` |
| Back link | `.back-link` | DirDetailPage, ArticlePage, LessonPage |
| Safety callout | `.safety` | WhatPage, PathPage, DirectoryPage, LessonPage |
| Success callout | `.safety-success` | SuggestPage |
| Container | `.container-x` | Nearly every page + Header/Footer/HeroSlider |
| Section padding | `.section`, `.section-light` | Home, What, Path, Blog, Events, etc. |
| List row card | `ListCard` component | HomePage (events + blog), BlogPage |
| Directory card | `DirectoryCard` | HomePage, DirectoryPage |
| Form field stack | label + `w-full p-3 border border-white/10 ... bg-[#121212]` | SuggestPage (select / input / textarea) |
| CTA “view all” | text button + `ArrowRight flip-rtl` | HomePage (3×) |
| Prose article body | `.prose` | What, Lesson, About, Disclaimer, Book |
| Cinematic image | `.cinematic-img` | DirectoryCard, ListCard, LiquidImage gallery |
| Flip icon | `.flip-rtl` | HeroSlider, PathPage, HomePage, LessonPage, ArticlePage, DirDetailPage |

No modal / dialog patterns exist today. No skeleton / placeholder components.

---

## 3. Duplicated Tailwind strings → future primitives

Report only (Phase 2+). Exact strings to preserve:

- Suggest form control: `w-full p-3 border border-white/10 text-[0.9rem] outline-none focus:border-white/40 bg-[#121212]`
- Suggest labels: `block font-semibold text-[0.85rem] mb-1.5`
- Back control: `back-link inline-flex items-center gap-1.5`
- Filter: `` `filter-btn ${active ? 'active' : ''}` ``
- Home “view all”: `text-sm font-semibold text-white/50 hover:text-white transition-colors flex items-center gap-1`
- Shell bg: `min-h-screen flex flex-col relative z-10 bg-[#0a0a0a]` (duplicates `--black`)
- Card chrome: `bg-[#121212] border border-white/5` (DirectoryCard / Book card)

---

## 4. Hardcoded values that should become named tokens (do not change values)

### CSS variables already present (`:root`)

`--black #0a0a0a`, `--dark #121212`, `--gray #666`, `--muted #999`, `--light #f0f0f0`, `--white #ffffff`, `--border #1a1a1a`, `--accent #c8102e`, `--accent-hover #a00d25`

### Repeated but not tokenized

| Value | Where |
|-------|--------|
| `#0a0a0a` / `bg-[#0a0a0a]` | App shell (duplicates `--black`) |
| `#121212` / `bg-[#121212]` | Cards, form fields (duplicates `--dark`) |
| `#c8102e` | Preloader SVG / pulse (duplicates `--accent`) |
| `#f9a825` | `.safety` border/text |
| `#2e7d32` / `#4caf50` / `#e8f5e9` | verified / success greens |
| z-index `9999` / `9997` / `9996` / `100` / `99` | Preloader, cursor, header, mobile menu |
| Ease `cubic-bezier(0.16, 1, 0.3, 1)` | Many animations / `.btn` / cinematic |
| Durations `0.9s`, `0.8s`, `0.7s`, `0.5s`, `0.3s`, `1.2s` | Reveal / hero / transitions |
| Container max `1400px`, pad `24px` | `.container-x` |
| Hero interval `6000` ms | HeroSlider |
| Preloader max `900` ms / min `400` ms | Preloader |

`tailwind.config.js` does not extend theme; almost all design is in `index.css` component classes.

---

## 5. Routing & data notes

- Custom History router: `pathFor` / `parsePath` in `components/nav.tsx`; `ROOT` from `import.meta.env.BASE_URL` (`/parkour`).
- Unknown path → `home` (not a dedicated 404).
- Detail routes: `/path/:num`, `/directory/:slug`, `/blog/:slug`.
- Demo ids confirmed for visual routes: `tishreen-park`, `safety-rules`.
- i18n: `LANG_LOCKED = true`, `SHOW_LANG_TOGGLE = false`. Arabic default.

---

## 6. File size snapshot (Phase 0)

| Lines | File | Flag |
|------:|------|------|
| 434 | `src/index.css` | over 200 (CSS design system — expected) |
| 289 | `src/data/demo.ts` | over 200 (neutral data tables — expected) |
| 197 | `src/pages/HomePage.tsx` | near 200; Phase 3 should extract sections |
| 161 | `src/data/useDemo.ts` | under 200 |
| 142 | `src/lib/liquid.ts` | under 200 |

Largest 5 TS/TSX after CSS: `demo.ts`, `HomePage.tsx`, `useDemo.ts`, `liquid.ts`, `HeroSlider.tsx`.

---

## 7. Phase 0 build baseline (bundle sizes)

*(Filled after `npm run build` in this phase.)*

| Asset | Size | Gzip |
|-------|------|------|
| `index.html` | 2.37 kB | 0.92 kB |
| `index-DTLvJzvS.css` | 27.53 kB | 6.40 kB |
| `index-t3cCBfcg.js` | 306.15 kB | 92.43 kB |
| `liquid-RSvfBKS0.js` | 524.13 kB | 130.55 kB |

---

## 8. Observations (do NOT fix in this refactor unless a later phase requires a move)

- Pre-existing ESLint `react-refresh/only-export-components` warnings on `nav.tsx` (exports helpers + provider). Clearing by splitting exports is allowed in Phase 1 only.
- Unknown URLs silently show Home (no 404 UI).
- `LanguageToggle` remains in the tree behind `SHOW_LANG_TOGGLE = false`.
- Suggest form does not POST; success is local state only.
- `three.js` liquid effect is a large chunk; code-splitting or dropping it would change experience — leave for a separate decision.
- Above-the-fold images do not set explicit width/height attributes (CLS risk); adding them only if size already matches is a later optional win.
- Font loading is non-blocking Google Fonts in `index.html`; changing strategy could flash — leave alone.
- Some `bg-[#0a0a0a]` / `bg-[#121212]` duplicate CSS variables (token naming only in Phase 2).
- No `any` / `@ts-ignore` found in `src/` at Phase 0.
- No deep relative `../../../` imports; `@/` is already used.
