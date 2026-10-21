import { useState } from 'react';
import { Search } from 'lucide-react';
import { DirectoryCard } from '@/features/directory/DirectoryCard';
import { Reveal } from '@/components/motion/Reveal';
import { Container, FilterButton, PageHero, Safety } from '@/components/ui';
import type { DirCategory } from '@/data/demo';
import { useDemo } from '@/data/useDemo';
import { localeOf } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';

type Filter = 'all' | DirCategory;

const FILTER_IDS: Filter[] = ['all', 'place', 'coach', 'team'];

export function DirectoryPage() {
  const { t, lang } = useI18n();
  const { directoryItems, categoriesPlural, dirCategoryLabels } = useDemo();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const items = directoryItems.filter((item) => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const loc = localeOf(lang);
    const q = query.trim().toLocaleLowerCase(loc);
    const matchesQuery =
      !q ||
      item.name.toLocaleLowerCase(loc).includes(q) ||
      item.area.toLocaleLowerCase(loc).includes(q) ||
      dirCategoryLabels[item.category].toLocaleLowerCase(loc).includes(q);
    return matchesFilter && matchesQuery;
  });

  return (
    <div>
      <PageHero title={t('pages.directory.heroTitle')} description={t('pages.directory.heroSub')} />
      <Reveal as="section" className="section">
        <Container>
          <Safety title={t('pages.directory.noteTitle')}>{t('pages.directory.noteText')}</Safety>
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            <div className="relative">
              <Search
                size={15}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-white/50"
              />
              <input
                type="text"
                placeholder={t('common.search')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="ps-9 pe-3.5 py-2 border border-white/10 text-sm outline-none focus:border-white/40 bg-ps-dark min-w-[140px] sm:min-w-[180px]"
              />
            </div>
            {FILTER_IDS.map((id) => (
              <FilterButton key={id} active={filter === id} onClick={() => setFilter(id)}>
                {id === 'all' ? t('common.all') : categoriesPlural[id]}
              </FilterButton>
            ))}
          </div>
          {items.length > 0 ? (
            <Reveal type="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <DirectoryCard key={item.id} item={item} />
              ))}
            </Reveal>
          ) : (
            <p className="text-white/50 text-center py-12">{t('pages.directory.empty')}</p>
          )}
        </Container>
      </Reveal>
    </div>
  );
}
