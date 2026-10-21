# Parkour Syria — Backend API

Laravel 13 API for the Parkour Syria website and its future dashboard. It is the Aroma Care
platform (Passport, Spatie permissions, Astrotomic translations, L5-Swagger, BaseService /
ApiController kernel) with the pharmacy modules removed and the Parkour Phase 1 content added.

## Stack

| Concern | Package / pattern |
|---|---|
| Auth | Laravel Passport, `auth:api`, access + refresh token pair (`/api/admin/auth/*`) |
| Roles | Spatie Permission, `api` guard, `App\Constant\PermissionType`, `php artisan app:update-admin-roles` |
| i18n | Astrotomic Translatable, `X-Locale` header (`ar` / `en`) |
| Docs | L5-Swagger, `#[OA\…]` attributes, schemas in `app/Http/Docs/Schemas` |
| Tests | Pest 4 (PHPUnit 12), MySQL test database |
| CRUD kernel | `BaseModel`, `BaseService`, `ApiController`, `QueryFilter`, FormRequests, Resources, `ApiResponser` |

## Getting started

```bash
cp .env.example .env
composer install
php artisan key:generate
mysql -uroot -e "CREATE DATABASE parkour_syria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE DATABASE parkour_syria_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan passport:keys
php artisan migrate --seed          # schema + Passport client, roles, permissions, dashboard accounts
mysql -uroot parkour_syria < database/sql/parkour_content.sql   # the website content
php artisan cache:clear
php artisan storage:link
php artisan l5-swagger:generate     # docs at /api/doc
php artisan serve
```

Seeded accounts (change via `SEED_*` in `.env`):

| Role | Email | Can do |
|---|---|---|
| SuperAdmin | `admin@parkoursyria.com` | everything, incl. settings, users, roles |
| Supervisor | `supervisor@parkoursyria.com` | content only: pages, sliders, lessons, areas, directory, events, suggestions, blog |

## Content (`database/sql/parkour_content.sql`)

The seeders only create the platform (accounts, roles, permissions). The website content is a
plain SQL file, taken from the current SPA (`src/locales/*.json`, `src/data/demo.ts`,
`src/config/site.ts`, `src/pages/HomePage.tsx`) in Arabic and English:

| Table | Rows |
|---|---|
| areas | 4 (mazzeh, abu-rummaneh, kafr-sousa, other) |
| pages | 11 (home, what, path, directory, events, blog, suggest, book, about, contact, disclaimer) |
| sliders | 3 hero slides |
| lessons | 7 (slugs `1`–`7`) |
| directory_entries | 6 |
| events | 3 (real demo dates, 23 Oct – 1 Nov 2026, Damascus time) |
| blog_categories / blog_posts | 3 / 3 |
| gallery_images | 8 |
| multi_type_settings | 12 (WhatsApp, social handles, email, safety notices, …) |

The file replaces those content tables and upserts the settings by key; accounts, roles,
suggestions and shop tables are never touched, so it is safe to re-run to reset the content.
Run `php artisan cache:clear` after importing (home, settings and sitemap are cached).

## API

All responses use the Aroma Care envelope:

- list: `{ success, statusCode, pagination: { page, limit, pages, totalItems, items } }`
- one: `{ success, message, data }`
- error: `{ success: false, error }`

Query: `?page&limit&sort&direction&search` plus each resource's filters. JSON in and out is camelCase.

### Website (public, published content only)

| Endpoint | Notes |
|---|---|
| `GET /api/home` | sliders, latest blog posts, upcoming events, verified directory slice, `home` page. Cached 90 s per locale, flushed on edit |
| `GET /api/site-settings` | only the keys allowlisted in `config/site.php` |
| `GET /api/pages/{key}` | `home`, `what`, `about`, `contact`, `disclaimer`, `book` |
| `GET /api/sliders` | |
| `GET /api/lessons`, `/api/lessons/{slug}` | ordered by `sort_order`; slugs `1`–`7` match `/path/:num` on the SPA |
| `GET /api/areas`, `/api/areas/{slug}` | |
| `GET /api/directory-entries`, `/{slug}` | filters: `type`, `area` (slug), `areaId`, `verified`, `search` |
| `GET /api/events`, `/{slug}` | upcoming only, past events answer 404 |
| `GET /api/blog-categories`, `/api/blog-posts`, `/{slug}` | posts filter: `category` (slug); newest first |
| `GET /api/gallery-images` | home gallery, in `sort_order` |
| `POST /api/suggestions` | no account, 5 per minute per visitor, always lands as `pending` |
| `GET /api/seo/sitemap.xml`, `/robots.txt`, `/llms.txt` | for the website host to serve at its root |
| `GET /api/options/*` | label/value lists for dropdowns |

### Dashboard (`/api/admin/*`, Bearer token + permission)

Full CRUD + `bulk-delete` + csv `export` for areas, sliders, lessons, directory-entries, events,
blog-categories, blog-posts, gallery-images, users, roles; pages are index/show/update only (fixed keys);
multi-type-settings (SuperAdmin). Suggestions: index/show/update/delete plus
`POST /suggestions/{id}/accept` (creates a directory entry or event) and
`POST /suggestions/{id}/reject` (`rejectReason` required). Uploads are multipart; updates with a
file use `POST` + `_method=PUT`.

## Feature flags (`config/features.php`)

| Flag | Default | Off | On |
|---|---|---|---|
| `FEATURE_PUBLIC_EN_LOCALE` | `false` | public API answers in Arabic whatever `X-Locale` says | `X-Locale: en` serves English (falls back to Arabic per field) |
| `FEATURE_ECOMMERCE` | `false` | shop routes not registered, shop permissions not synced | brands, categories, tags, currencies, products, coupons, orders routes + permissions |

The shop tables exist from the first migration, so turning the shop on needs no migration — only
`php artisan app:update-admin-roles`. There is no payment gateway; the book stays a WhatsApp order.

## Tests

```bash
./vendor/bin/pest
```

Feature tests live in `tests/Feature/Parkour`, run against `parkour_syria_testing` (see
`phpunit.xml`), seed the accounts and load `database/sql/parkour_content.sql` before each test.

## Adding a resource

Follow `.cursor/rules/backend-crud-feature.mdc` at the repo root: migration → model (+ translation)
→ service → filter → resource → FormRequest → admin controller → public controller → routes →
`PermissionType` → `app:update-admin-roles` → OpenAPI schema.
