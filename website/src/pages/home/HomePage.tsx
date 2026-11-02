import { ArrowRight } from 'lucide-react';
import { HeroSlider } from '@/features/hero-slider/HeroSlider';
import { DirectoryCard } from '@/features/directory/DirectoryCard';
import { ListCard } from '@/features/list-card/ListCard';
import { Reveal } from '@/components/motion/Reveal';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { LiquidImage } from '@/components/motion/LiquidImage';
import { useNav } from '@/components/nav';
import { Button, Container, SectionHeading } from '@/components/ui';
import { btnSize, btnVariant } from '@/components/ui/variants';
import { cn } from '@/lib/cn';
import { site, whatsappLink } from '@/config/site';
import { useDirectory } from '@/hooks/useDirectory';
import { useEvents } from '@/hooks/useEvents';
import { useGallery } from '@/hooks/useGallery';
import { usePosts } from '@/hooks/usePosts';
import { useI18n } from '@/i18n/useI18n';
import { photo, photoSet } from '@/lib/photo';

export function HomePage() {
  const { navigate } = useNav();
  const { t } = useI18n();
  const { data: directoryItems } = useDirectory();
  const { data: events } = useEvents();
  const { data: blogPosts } = usePosts();
  const { data: galleryImages } = useGallery();
  const featuredDir = directoryItems.slice(0, 3);
  const upcomingEvents = events.slice(0, 2);
  const recentPosts = blogPosts.slice(0, 3);
  const bookWa = whatsappLink(site.whatsappMain, t('book.whatsappMessage'));

  return (
    <div>
      <HeroSlider />

      <section className="section-light">
        <Reveal className="py-20 sm:py-28 text-center">
          <Container>
            <div className="section-label">{t('pages.home.welcomeLabel')}</div>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-5 leading-[1.15] max-w-[800px] mx-auto">
              {t('pages.home.introTitle')}
            </h2>
            <p className="text-white/50 max-w-[600px] mx-auto mb-8 text-base sm:text-lg font-light leading-relaxed">
              {t('pages.home.introText')}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button type="button" variant={btnVariant.dark} size={btnSize.lg} onClick={() => navigate('path')}>
                {t('nav.path')}
              </Button>
              <Button type="button" variant={btnVariant.outline} size={btnSize.lg} onClick={() => navigate('directory')}>
                {t('nav.directory')}
              </Button>
            </div>
          </Container>
        </Reveal>
      </section>

      <Reveal as="section" className="section">
        <Container>
          <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
            <SectionHeading
              label={t('pages.home.directoryLabel')}
              title={t('pages.home.directoryHeading')}
            />
            <button
              type="button"
              onClick={() => navigate('directory')}
              className="text-sm font-semibold text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              {t('common.viewAll')} <ArrowRight size={16} className="flip-rtl" />
            </button>
          </div>
          <Reveal type="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredDir.map((item) => (
              <DirectoryCard key={item.id} item={item} />
            ))}
          </Reveal>
        </Container>
      </Reveal>

      <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <ParallaxImage
          src="https://images.pexels.com/photos/6008979/pexels-photo-6008979.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          alt={t('pages.home.parallaxAlt')}
          ratio="auto"
          className="h-full"
        >
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Reveal className="text-center">
              <div className="section-label text-white/60">{t('pages.home.philosophyLabel')}</div>
              <p className="text-2xl sm:text-4xl font-extrabold text-white max-w-[700px] px-6 leading-[1.3]">
                {t('pages.home.quote')}
              </p>
            </Reveal>
          </div>
        </ParallaxImage>
      </section>

      <Reveal as="section" className="section section-light">
        <Container>
          <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
            <SectionHeading
              label={t('pages.home.eventsLabel')}
              title={t('pages.home.eventsHeading')}
            />
            <button
              type="button"
              onClick={() => navigate('events')}
              className="text-sm font-semibold text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              {t('common.viewAll')} <ArrowRight size={16} className="flip-rtl" />
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
        </Container>
      </Reveal>

      <Reveal as="section" className="section">
        <Container>
          <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
            <SectionHeading
              label={t('pages.home.blogLabel')}
              title={t('pages.home.blogHeading')}
            />
            <button
              type="button"
              onClick={() => navigate('blog')}
              className="text-sm font-semibold text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              {t('common.viewAll')} <ArrowRight size={16} className="flip-rtl" />
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
        </Container>
      </Reveal>

      <Reveal as="section" className="section bg-black pt-16 pb-16">
        <Container>
          <div className="text-center mb-12">
            <SectionHeading
              label={t('pages.home.galleryLabel')}
              title={t('pages.home.galleryHeading')}
            />
            <p className="text-white/40 mt-3 text-sm">{t('pages.home.gallerySub')}</p>
          </div>
          <Reveal type="stagger" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
            {galleryImages.map((img) => (
              <div
                key={img.id}
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
        </Container>
      </Reveal>

      <Reveal as="section" type="reveal-clip" className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <ParallaxImage
          src="https://images.pexels.com/photos/6009011/pexels-photo-6009011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          alt={t('pages.home.bookAlt')}
          ratio="auto"
          className="h-full"
        >
          <div className="absolute inset-0 bg-black/70 flex items-center">
            <Container>
              <div className="max-w-[560px]">
                <div className="section-label">{t('pages.home.bookLabel')}</div>
                <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-[1.15]">
                  {t('pages.home.bookHeading')}
                </h2>
                <p className="text-white/60 mb-8 text-base sm:text-lg font-light leading-relaxed">
                  {t('pages.home.bookText')}
                </p>
                <a
                  href={bookWa}
                  target="_blank"
                  rel="noreferrer"
                  className={cn('btn', 'btn-accent', 'btn-lg')}
                >
                  {t('pages.home.bookCta')}
                </a>
              </div>
            </Container>
          </div>
        </ParallaxImage>
      </Reveal>
    </div>
  );
}
