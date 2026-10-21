import { ChevronLeft } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { useNav } from '@/components/nav';
import { BackButton, Container, Tag } from '@/components/ui';
import { usePost } from '@/hooks/usePosts';
import { useI18n } from '@/i18n/useI18n';
import { photo, photoSet } from '@/lib/photo';

export function ArticlePage() {
  const { navigate, id } = useNav();
  const { t } = useI18n();
  const { data: post } = usePost(id);

  return (
    <div>
      <Reveal as="section" className="section">
        <Container className="max-w-[760px]">
          <BackButton type="button" onClick={() => navigate('blog')}>
            <ChevronLeft size={16} className="flip-rtl" />
            {t('pages.article.back')}
          </BackButton>
          <div className="flex gap-2 mb-3">
            <Tag>{post.category}</Tag>
          </div>
          <h1 className="text-2xl font-extrabold mb-3">{post.title}</h1>
          <div className="text-sm text-white/50 mb-6 pb-4 border-b border-white/10">
            {t('pages.article.byline', {
              date: post.date,
              team: t('pages.article.team'),
            })}
          </div>
          <Reveal type="reveal-scale" className="overflow-hidden mb-6">
            <img
              src={photo(post.image, 1280)}
              srcSet={photoSet(post.image, [760, 1280])}
              sizes="(min-width: 760px) 712px, 100vw"
              alt={post.title}
              className="w-full max-h-[380px] object-cover"
            />
          </Reveal>
          <p className="mb-4 text-white/75">{post.excerpt}</p>
          {!post.body && <p className="text-white/50 text-[0.9rem]">{t('pages.article.comingSoon')}</p>}
          {post.body?.map((section, i) => (
            <div key={i}>
              <h2 className="text-xl font-bold mt-7 mb-3">{section.heading}</h2>
              <p className="mb-4 text-white/75">{section.text}</p>
            </div>
          ))}
        </Container>
      </Reveal>
    </div>
  );
}
