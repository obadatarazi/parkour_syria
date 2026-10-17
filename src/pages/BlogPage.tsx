import { useState } from 'react';
import { ListCard } from '@/components/ListCard';
import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
import { blogPosts } from '@/data/demo';

const filters = ['الكل', 'أمان', 'تدريب', 'دمشق'];

export function BlogPage() {
  const { navigate } = useNav();
  const [filter, setFilter] = useState('الكل');

  const posts = filter === 'الكل' ? blogPosts : blogPosts.filter((p) => p.category === filter);

  return (
    <div>
      <div className="page-hero">
        <div className="container-x">
          <h1>المدونة</h1>
          <p>مقالات عن الباركور والأمان</p>
        </div>
      </div>
      <Reveal as="section" className="section">
        <div className="container-x">
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
              >
                {f}
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
                onClick={() => navigate('article')}
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
