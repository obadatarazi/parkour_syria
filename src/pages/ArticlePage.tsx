import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
import { blogPosts } from '@/data/demo';
import { photo, photoSet } from '@/lib/photo';

export function ArticlePage() {
  const { navigate, id } = useNav();
  const post = blogPosts.find((p) => p.id === id) ?? blogPosts[0];

  return (
    <div>
      <Reveal as="section" className="section">
        <div className="container-x max-w-[760px]">
          <button onClick={() => navigate('blog')} className="back-link">
            → العودة للمدونة
          </button>
          <div className="flex gap-2 mb-3">
            <span className="tag">{post.category}</span>
          </div>
          <h1 className="text-2xl font-extrabold mb-3">{post.title}</h1>
          <div className="text-sm text-white/50 mb-6 pb-4 border-b border-white/10">
            {post.date} · فريق باركور سوريا
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
          {!post.body && <p className="text-white/50 text-[0.9rem]">المقال الكامل قريباً.</p>}
          {post.body?.map((section, i) => (
            <div key={i}>
              <h2 className="text-xl font-bold mt-7 mb-3">{section.heading}</h2>
              <p className="mb-4 text-white/75">{section.text}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
