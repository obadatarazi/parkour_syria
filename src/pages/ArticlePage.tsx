import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
import { blogPosts } from '@/data/demo';

export function ArticlePage() {
  const { navigate } = useNav();
  const post = blogPosts[0];

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
          <div className="text-sm text-[#888] mb-6 pb-4 border-b border-[#e5e5e5]">
            {post.date} · فريق باركور سوريا
          </div>
          <Reveal type="reveal-scale" className="overflow-hidden mb-6">
            <img src={post.image} alt={post.title} className="w-full max-h-[380px] object-cover" />
          </Reveal>
          <p className="mb-4 text-[#1a1a1a]">
            الباركور رياضة ممتعة، لكن الأمان يجب أن يكون دائماً الأولوية.
          </p>
          {post.body?.map((section, i) => (
            <div key={i}>
              <h2 className="text-xl font-bold mt-7 mb-3">{section.heading}</h2>
              <p className="mb-4 text-[#1a1a1a]">{section.text}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
