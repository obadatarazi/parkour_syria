import { ArrowLeft } from 'lucide-react';
import { HeroSlider } from '@/components/HeroSlider';
import { DirectoryCard } from '@/components/DirectoryCard';
import { ListCard } from '@/components/ListCard';
import { Reveal } from '@/components/Reveal';
import { ParallaxImage } from '@/components/ParallaxImage';
import { LiquidImage } from '@/components/LiquidImage';
import { useNav } from '@/components/nav';
import { directoryItems, events, blogPosts, galleryImages } from '@/data/demo';
import { photo, photoSet } from '@/lib/photo';

export function HomePage() {
  const { navigate } = useNav();
  const featuredDir = directoryItems.slice(0, 3);
  const upcomingEvents = events.slice(0, 2);
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <div>
      <HeroSlider />

      <section className="section-light">
        <Reveal className="py-20 sm:py-28 text-center">
          <div className="container-x">
            <div className="section-label">مرحباً بك</div>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-5 leading-[1.15] max-w-[800px] mx-auto">
              تعلّم الباركور بأمان في دمشق
            </h2>
            <p className="text-white/50 max-w-[600px] mx-auto mb-8 text-base sm:text-lg font-light leading-relaxed">
              منصة سورية مرتبطة بـ Parkour.com — دليل أماكن ومدربين، دروس للمبتدئين، فعاليات، ومقالات.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => navigate('path')} className="btn btn-dark btn-lg">
                مسار المبتدئ
              </button>
              <button onClick={() => navigate('directory')} className="btn btn-outline btn-lg">
                الدليل
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      <Reveal as="section" className="section">
        <div className="container-x">
          <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
            <div>
              <div className="section-label">الدليل</div>
              <h2 className="section-title">من الدليل · دمشق</h2>
            </div>
            <button
              onClick={() => navigate('directory')}
              className="text-sm font-semibold text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              عرض الكل <ArrowLeft size={16} />
            </button>
          </div>
          <Reveal type="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredDir.map((item) => (
              <DirectoryCard key={item.id} item={item} />
            ))}
          </Reveal>
        </div>
      </Reveal>

      <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <ParallaxImage
          src="https://images.pexels.com/photos/6008979/pexels-photo-6008979.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          alt="parkour action"
          ratio="auto"
          className="h-full"
        >
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Reveal className="text-center">
              <div className="section-label text-white/60">فلسفة</div>
              <p className="text-2xl sm:text-4xl font-extrabold text-white max-w-[700px] px-6 leading-[1.3]">
                كن قوياً لتكون نافعاً
              </p>
            </Reveal>
          </div>
        </ParallaxImage>
      </section>

      <Reveal as="section" className="section section-light">
        <div className="container-x">
          <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
            <div>
              <div className="section-label">الفعاليات</div>
              <h2 className="section-title">الفعاليات القادمة</h2>
            </div>
            <button
              onClick={() => navigate('events')}
              className="text-sm font-semibold text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              عرض الكل <ArrowLeft size={16} />
            </button>
          </div>
          <Reveal type="stagger" className="grid grid-cols-1 gap-8">
            {upcomingEvents.map((ev) => (
              <ListCard
                key={ev.id}
                meta={`${ev.type} · ${ev.date}`}
                title={ev.title}
                image={ev.image}
              >
                {ev.location}
              </ListCard>
            ))}
          </Reveal>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="container-x">
          <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
            <div>
              <div className="section-label">المدونة</div>
              <h2 className="section-title">من المدونة</h2>
            </div>
            <button
              onClick={() => navigate('blog')}
              className="text-sm font-semibold text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              عرض الكل <ArrowLeft size={16} />
            </button>
          </div>
          <Reveal type="stagger" className="grid grid-cols-1 gap-8">
            {recentPosts.map((post) => (
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

      <Reveal as="section" className="section bg-black pt-16 pb-16">
        <div className="container-x">
          <div className="text-center mb-12">
            <div className="section-label">معرض</div>
            <h2 className="section-title">معرض الصور</h2>
            <p className="text-white/40 mt-3 text-sm">لقطات من تدريبات الباركور</p>
          </div>
          <Reveal type="stagger" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className="relative overflow-hidden group cursor-pointer"
                style={{ aspectRatio: '4/5' }}
              >
                <LiquidImage
                  src={photo(img.url, 700)}
                  srcSet={photoSet(img.url, [400, 700])}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  alt={img.caption}
                  className="cinematic-img"
                  style={{ position: 'absolute', inset: 0 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                  <span className="text-white text-sm font-semibold">{img.caption}</span>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </Reveal>

      <Reveal as="section" type="reveal-clip" className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <ParallaxImage
          src="https://images.pexels.com/photos/6009011/pexels-photo-6009011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          alt="parkour book"
          ratio="auto"
          className="h-full"
        >
          <div className="absolute inset-0 bg-black/70 flex items-center">
            <div className="container-x">
              <div className="max-w-[560px]">
                <div className="section-label">الكتاب</div>
                <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-[1.15]">
                  كتاب الباركور
                </h2>
                <p className="text-white/60 mb-8 text-base sm:text-lg font-light leading-relaxed">
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
        </ParallaxImage>
      </Reveal>
    </div>
  );
}
