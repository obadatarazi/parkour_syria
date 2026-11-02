# UI primitives (`src/components/ui`)

All primitives wrap existing CSS in `styles/index.css` (`.btn`, `.tag`, `.container-x`, …). **Do not change responsive classes** (`sm`/`md`/`lg`/`xl`, grids, containers) when editing primitives — restore original markup classes if visuals drift.

Import from `@/components/ui` (or a specific file). Prefer `btnVariant` / `btnSize` / `tagVariant` from `@/components/ui/variants` in JSX to avoid i18n lint false positives on string attributes.

DEV catalog: `/parkour/ui-kit` (dev server only).

---

## Button

**Props:** `variant?: 'dark' | 'outline' | 'accent'` (default `dark`), `size?: 'sm' | 'lg'`, `block?: boolean`, plus native `button` attributes (`type`, `onClick`, `className`, `children`, `ref`).

```tsx
import { Button } from '@/components/ui';
import { btnSize, btnVariant } from '@/components/ui/variants';

<Button type="button" variant={btnVariant.dark} size={btnSize.lg} onClick={go}>
  {t('nav.path')}
</Button>
```

---

## ButtonLink

In-app `<a>` styled as a button (uses `useLink`).

**Props:** `page: PageId`, `id?: string`, same `variant` / `size` / `block` / `className` / `children` as Button, plus other `<a>` attrs except `href`.

```tsx
<ButtonLink page="contact" variant={btnVariant.outline}>
  {t('pages.about.contactCta')}
</ButtonLink>
```

---

## Tag

**Props:** `variant?: 'default' | 'verified'` (default `default`), `className`, `children`, `ref`, other `span` attrs.

```tsx
import { Tag } from '@/components/ui';
import { tagVariant } from '@/components/ui/variants';

<Tag>{label}</Tag>
<Tag variant={tagVariant.verified}>{t('common.verified')}</Tag>
```

---

## Container

**Props:** `className`, `children`, `ref`, other `div` attrs. Applies `container-x`.

```tsx
<Container className="max-w-[720px]">…</Container>
```

---

## Section

**Props:** `light?: boolean` (adds `section section-light` when true, else `section`), `as?: ElementType` (default `section`), `className`, `children`, `ref`.

```tsx
<Section light>{/* … */}</Section>
```

Note: many pages keep `Reveal as="section" className="section section-light"` so motion stays on the section element.

---

## SectionHeading

**Props:** `label?: ReactNode`, `title?: ReactNode`, `labelClassName?`, `titleClassName?`, `className`, `children`, `ref`.

```tsx
<SectionHeading
  label={t('pages.home.directoryLabel')}
  title={t('pages.home.directoryHeading')}
/>
```

---

## PageHero

**Props:** `title?: ReactNode`, `description?: ReactNode`, `containerClassName?`, `className`, `children`, `ref`.  
Renders `.page-hero` + `Container`. Pass `children` for custom hero content (e.g. back link + heading).

```tsx
<PageHero title={t('pages.what.heroTitle')} description={t('pages.what.heroSub')} />
```

```tsx
<PageHero>
  <BackButton type="button" onClick={() => navigate('path')}>…</BackButton>
  <h1>{heading}</h1>
  <p>{sub}</p>
</PageHero>
```

---

## Field / FieldLabel

**Field props:** `className`, `children`, `ref` (wrapper `mb-4`).  
**FieldLabel props:** native `label` attrs + `className` / `children`.

```tsx
<Field>
  <FieldLabel htmlFor="name">{t('pages.suggest.nameLabel')} *</FieldLabel>
  <Input id="name" name="name" required />
</Field>
```

---

## Input

**Props:** native `input` attrs. Default classes match Suggest form controls (`bg-ps-dark`, border, padding).

```tsx
<Input type="text" name="contact" placeholder={t('pages.suggest.contactPlaceholder')} />
```

---

## Textarea

**Props:** native `textarea` attrs. Includes `min-h-[100px] resize-y`.

```tsx
<Textarea name="description" required placeholder={t('pages.suggest.descPlaceholder')} />
```

---

## Select

**Props:** native `select` attrs + `children` (`option`s).

```tsx
<Select required name="type" defaultValue="">
  <option value="">{t('common.choosePlaceholder')}</option>
  <option value="place">{t('pages.suggest.types.place')}</option>
</Select>
```

---

## FilterButton

**Props:** `active?: boolean`, plus native `button` attrs.

```tsx
<FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
  {t('common.all')}
</FilterButton>
```

---

## BackButton / BackLink

Shared classes: `back-link inline-flex items-center gap-1.5`.

**BackButton:** native `button` (use for `navigate(...)`).  
**BackLink:** `page: PageId`, `id?: string`, in-app `<a>` via `useLink`.

```tsx
<BackButton type="button" onClick={() => navigate('blog')}>
  <ChevronLeft size={16} className="flip-rtl" />
  {t('pages.article.back')}
</BackButton>
```

---

## Safety / SafetySuccess

**Props:** `title?: ReactNode` (rendered in `<strong>`), `children`, `className`, `ref`.

```tsx
<Safety title={t('pages.what.safetyTitle')}>{t('pages.what.safetyText')}</Safety>
<SafetySuccess title={t('pages.suggest.successTitle')}>
  {t('pages.suggest.successText')}
</SafetySuccess>
```

---

## Related

- Tokens: `tailwind.config.js` `ps.*` colors mirror `:root` in `styles/index.css`.
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md).
