import { BookOpen } from 'lucide-react';
import { HeroSlider } from '@/components/HeroSlider';
import { DirectoryCard } from '@/components/DirectoryCard';
import { ListCard } from '@/components/ListCard';
import { Reveal } from '@/components/Reveal';
import { useNav } from '@/components/nav';
import { directoryItems, events, blogPosts, galleryImages } from '@/data/demo';

export function HomePage() {
  const { navigate } = useNav();
  const featuredDir = directoryItems.slice(0, 3);
  const upcomingEvents = events.slice(0, 2);
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <div>
      <HeroSlider />

      <Reveal className="py-10 border-b border-[#e5e5e5] text-center">
        <div className="container-x">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2.5">باركور سوريا</h1>
          <p className="text-[#555] max-w-[560px] mx-auto mb-5 text-[0.95rem]">
            منصة سورية مرتبطة بـ Parkour.com لتعلّم الباركور بأمان في دمشق — دليل أماكن ومدربين،
            دروس للمبتدئين، فعاليات، ومقالات.
          </p>
          <div className="flex gap-2.5 justify-center flex-wrap">
            <button onClick={() => navigate('path')} className="btn btn-dark">
              مسار المبتدئ
            </button>
            <button onClick={() => navigate('directory')} className="btn btn-outline">
              الدليل
            </button>
            <button onClick={() => navigate('suggest')} className="btn btn-outline">
              اقترح إضافة
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="container-x">
          <div className="flex items-baseline justify-between mb-7 gap-4 flex-wrap">
            <h2 className="text-2xl font-extrabold">من الدليل · دمشق</h2>
            <button
              onClick={() => navigate('directory')}
              className="text-sm font-semibold text-[#555] hover:text-black"
            >
              عرض الكل ←
            </button>
          </div>
          <Reveal type="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredDir.map((item) => (
              <DirectoryCard key={item.id} item={item} />
            ))}
          </Reveal>
        </div>
      </Reveal>

      <Reveal as="section" className="section bg-[#f5f5f5] border-t border-b border-[#e5e5e5]">
        <div className="container-x">
          <div className="flex items-baseline justify-between mb-7 gap-4 flex-wrap">
            <h2 className="text-2xl font-extrabold">الفعاليات القادمة</h2>
            <button
              onClick={() => navigate('events')}
              className="text-sm font-semibold text-[#555] hover:text-black"
            >
              عرض الكل ←
            </button>
          </div>
          <Reveal type="stagger" className="grid grid-cols-1 gap-6">
            {upcomingEvents.map((ev) => (
              <ListCard key={ev.id} meta={`${ev.type} · ${ev.date}`} title={ev.title} image={ev.image}>
                {ev.location}
              </ListCard>
            ))}
          </Reveal>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="container-x">
          <div className="flex items-baseline justify-between mb-7 gap-4 flex-wrap">
            <h2 className="text-2xl font-extrabold">من المدونة</h2>
            <button
              onClick={() => navigate('blog')}
              className="text-sm font-semibold text-[#555] hover:text-black"
            >
              عرض الكل ←
            </button>
          </div>
          <Reveal type="stagger" className="grid grid-cols-1 gap-6">
            {recentPosts.map((post) => (
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

      <Reveal as="section" className="section bg-[#111] pt-16 pb-16">
        <div className="container-x">
          <h2 className="text-2xl font-extrabold text-white mb-2 text-center">معرض الصور</h2>
          <p className="text-[#999] text-center mb-8 text-sm">لقطات من تدريبات الباركور</p>
          <Reveal type="stagger" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className="relative overflow-hidden group cursor-pointer"
                style={{ aspectRatio: '4/3' }}
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <span className="text-white text-xs font-semibold">{img.caption}</span>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </Reveal>

      <Reveal as="section" type="reveal-jump" className="section pt-0">
        <div className="container-x">
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-8 items-center bg-[#111] text-white p-10 sm:px-7 text-center sm:text-right">
            <div className="w-[140px] h-[190px] bg-[#333] flex items-center justify-center mx-auto">
              <BookOpen size={40} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold mb-3">
                كتاب الباركور · دليل المبتدئ الآمن
              </h2>
              <p className="opacity-80 mb-5 text-[0.95rem]">
                دليل عملي بالعربية يشرح أساسيات الباركور بأسلوب بسيط وآمن. الطلب عبر واتساب فقط.
              </p>
              <a
                href="https://wa.me/963999000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%B7%D9%84%D8%A8%20%D9%83%D8%AA%D8%A7%D8%A8%20%D8%A7%D9%84%D8%A8%D8%A7%D8%B1%D9%83%D9%88%D8%B1"
                target="_blank"
                rel="noreferrer"
                className="btn btn-accent btn-lg"
              >
                اطلب الكتاب عبر واتساب
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
