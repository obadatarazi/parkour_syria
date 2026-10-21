/* DEV catalog: prop enums and English labels are not product copy. */
/* eslint-disable i18next/no-literal-string */
import { useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import {
  BackButton,
  Button,
  ButtonLink,
  Container,
  Field,
  FieldLabel,
  FilterButton,
  Input,
  PageHero,
  Safety,
  SafetySuccess,
  Section,
  SectionHeading,
  Select,
  Tag,
  Textarea,
} from '@/components/ui';

const copy = {
  title: 'UI Kit',
  sub: 'DEV only — primitives for visual parity checks. Not in production routes.',
  buttons: 'Buttons',
  tags: 'Tags',
  filters: 'Filters',
  form: 'Form controls',
  callouts: 'Callouts',
  heading: 'Section heading',
  back: 'Back link',
  dark: 'Dark',
  outline: 'Outline',
  accent: 'Accent',
  small: 'Small',
  large: 'Large',
  block: 'Block',
  link: 'As link (home)',
  tagDefault: 'Place',
  tagVerified: 'Verified',
  filterAll: 'All',
  filterPlaces: 'Places',
  label: 'Label',
  placeholder: 'Placeholder',
  choose: 'Choose…',
  optionA: 'Option A',
  safetyTitle: 'Safety',
  safetyBody: 'Sample safety callout body.',
  successTitle: 'Success',
  successBody: 'Sample success callout body.',
  eyebrow: 'Eyebrow',
  headingText: 'Heading text',
  backLabel: 'Back',
} as const;

function KitBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-12">
      <h2 className="text-sm font-bold uppercase tracking-widest text-ps-muted mb-4">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function UiKitPage() {
  const [filter, setFilter] = useState<'all' | 'places'>('all');

  useEffect(() => {
    document.title = `${copy.title} | Parkour Syria`;
  }, []);

  return (
    <div>
      <PageHero title={copy.title} description={copy.sub} />
      <Section>
        <Container className="max-w-[900px]">
          <KitBlock title={copy.buttons}>
            <Button variant="dark">{copy.dark}</Button>
            <Button variant="outline">{copy.outline}</Button>
            <Button variant="accent">{copy.accent}</Button>
            <Button variant="dark" size="sm">
              {copy.small}
            </Button>
            <Button variant="dark" size="lg">
              {copy.large}
            </Button>
            <Button variant="dark" block className="max-w-xs">
              {copy.block}
            </Button>
            <ButtonLink page="home" variant="outline">
              {copy.link}
            </ButtonLink>
          </KitBlock>

          <KitBlock title={copy.tags}>
            <Tag>{copy.tagDefault}</Tag>
            <Tag variant="verified">{copy.tagVerified}</Tag>
          </KitBlock>

          <KitBlock title={copy.filters}>
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
              {copy.filterAll}
            </FilterButton>
            <FilterButton active={filter === 'places'} onClick={() => setFilter('places')}>
              {copy.filterPlaces}
            </FilterButton>
          </KitBlock>

          <div className="mb-12 max-w-md">
            <h2 className="text-sm font-bold uppercase tracking-widest text-ps-muted mb-4">{copy.form}</h2>
            <Field>
              <FieldLabel htmlFor="kit-input">{copy.label}</FieldLabel>
              <Input id="kit-input" placeholder={copy.placeholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="kit-select">{copy.label}</FieldLabel>
              <Select id="kit-select" defaultValue="">
                <option value="">{copy.choose}</option>
                <option value="a">{copy.optionA}</option>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="kit-area">{copy.label}</FieldLabel>
              <Textarea id="kit-area" placeholder={copy.placeholder} />
            </Field>
          </div>

          <div className="mb-12 max-w-lg space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-ps-muted mb-4">{copy.callouts}</h2>
            <Safety title={copy.safetyTitle}>{copy.safetyBody}</Safety>
            <SafetySuccess title={copy.successTitle}>{copy.successBody}</SafetySuccess>
          </div>

          <div className="mb-12">
            <h2 className="text-sm font-bold uppercase tracking-widest text-ps-muted mb-4">{copy.heading}</h2>
            <SectionHeading label={copy.eyebrow} title={copy.headingText} />
          </div>

          <div className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-ps-muted mb-4">{copy.back}</h2>
            <BackButton type="button">
              <ChevronLeft size={16} className="flip-rtl" />
              {copy.backLabel}
            </BackButton>
          </div>
        </Container>
      </Section>
    </div>
  );
}
