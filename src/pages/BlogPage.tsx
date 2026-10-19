import { useState } from 'react';
import { ListCard } from '@/components/ListCard';
import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
import type { BlogCategoryId } from '@/data/demo';
import { useDemo } from '@/data/useDemo';
import { useI18n } from '@/i18n/useI18n';

type BlogFilter = 'all' | BlogCategoryId;

const FILTER_IDS: BlogFilter[] = ['all', 'safety', 'training', 'damascus'];

export function BlogPage() {
  const { navigate } = useNav();
  const { t } = useI18n();
  const { blogPosts } = useDemo();
  const [filter, setFilter] = useState<BlogFilter>('all');

  const posts =
    filter === 'all' ? blogPosts : blogPosts.filter((p) => p.categoryId === filter);

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>{t('pages.blog.heroTitle')}</h1>
          <p>{t('pages.blog.heroSub')}</p>
        </div>
      </div>
      <Reveal as="section" className="section section-light">
        <div className="container-x">
          <div className="flex flex-wrap gap-2 mb-6">
            {FILTER_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`filter-btn ${filter === id ? 'active' : ''}`}
              >
                {t(`pages.blog.filters.${id}`)}
              </button>
            ))}
          </div>
          <Reveal type="stagger" className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <ListCard
                key={post.id}
                meta={`${post.category} · ${post.date}`}
                title={post.title}
                image={post.image}
                onClick={() => navigate('article', post.id)}
              >
                {post.excerpt}
              </ListCard>
            ))}
          </Reveal>
        </div>
      </Reveal>
    </div>
  );
}
