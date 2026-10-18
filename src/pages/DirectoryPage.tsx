import { useState } from 'react';
import { Search } from 'lucide-react';
import { DirectoryCard } from '@/components/DirectoryCard';
import { Reveal } from '@/components/Reveal';
import { directoryItems, dirCategoryLabels, type DirCategory } from '@/data/demo';

type Filter = 'all' | DirCategory;

const filters: { label: string; value: Filter }[] = [
  { label: 'الكل', value: 'all' },
  { label: 'أماكن', value: 'place' },
  { label: 'مدربون', value: 'coach' },
  { label: 'فرق', value: 'team' },
];

export function DirectoryPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const items = directoryItems.filter((item) => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesQuery =
      !query ||
      item.name.includes(query) ||
      item.area.includes(query) ||
      dirCategoryLabels[item.category].includes(query);
    return matchesFilter && matchesQuery;
  });

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>الدليل · دمشق</h1>
          <p>أماكن · مدربون · فرق</p>
        </div>
      </div>
      <Reveal as="section" className="section">
        <div className="container-x">
          <div className="safety">
            <strong>ملاحظة</strong>الإدراج ليس تزكية. لا نُدرج مباني متضررة.
          </div>
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            <div className="relative">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="ابحث..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-9 pl-3.5 py-2 border border-white/10 text-sm outline-none focus:border-white/40 bg-[#121212] min-w-[140px] sm:min-w-[180px]"
              />
            </div>
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`filter-btn ${filter === f.value ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {items.length > 0 ? (
            <Reveal type="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <DirectoryCard key={item.id} item={item} />
              ))}
            </Reveal>
          ) : (
            <p className="text-white/50 text-center py-12">لا توجد نتائج مطابقة.</p>
          )}
        </div>
      </Reveal>
    </div>
  );
}
