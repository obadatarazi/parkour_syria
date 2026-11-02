import { useState } from 'react';
import { ListCard } from '@/features/list-card/ListCard';
import { Reveal } from '@/components/motion/Reveal';
import { useNav } from '@/components/nav';
import { Container, FilterButton, PageHero } from '@/components/ui';
import { usePosts } from '@/hooks/usePosts';
import { useI18n } from '@/i18n/useI18n';
import type { BlogCategoryId } from '@/types';

type BlogFilter = 'all' | BlogCategoryId;

const FILTER_IDS: BlogFilter[] = ['all', 'safety', 'training', 'damascus'];

export function BlogPage() {
  const { navigate } = useNav();
  const { t } = useI18n();
  const { data: blogPosts } = usePosts();
  const [filter, setFilter] = useState<BlogFilter>('all');

  const posts =
    filter === 'all' ? blogPosts : blogPosts.filter((p) => p.categoryId === filter);

  return (
    <div>
      <PageHero title={t('pages.blog.heroTitle')} description={t('pages.blog.heroSub')} />
      <Reveal as="section" className="section section-light">
        <Container>
          <div className="flex flex-wrap gap-2 mb-6">
            {FILTER_IDS.map((id) => (
              <FilterButton key={id} active={filter === id} onClick={() => setFilter(id)}>
                {t(`pages.blog.filters.${id}`)}
              </FilterButton>
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
        </Container>
      </Reveal>
    </div>
  );
}
