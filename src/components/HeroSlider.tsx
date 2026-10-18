import { useEffect, useState, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useNav } from '@/components/nav';
import { slides } from '@/data/demo';

export function HeroSlider() {
  const { navigate } = useNav();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const show = (i: number) => setCurrent((i + slides.length) % slides.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) show(current - 1);
      else show(current + 1);
    }
  };

  return (
    <div
      className="relative w-full h-screen min-h-[560px] overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-[1.2s] ease-out ${
            i === current
              ? 'opacity-100 scale-100 z-[2]'
              : 'opacity-0 scale-105 z-0'
          }`}
        >
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.55) contrast(1.15) grayscale(15%)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40 z-[1]" />
          <div className="relative z-[2] w-full h-full flex items-end pb-20 sm:pb-28">
            <div className="container-x text-white w-full">
              <div
                className={`transition-all duration-700 ${
                  i === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: i === current ? '0.3s' : '0s' }}
              >
                <div className="text-xs font-bold tracking-[0.2em] opacity-70 mb-4 uppercase">
                  {slide.cat}
                </div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] max-w-[680px] mb-5 letter-spacing-tight">
                  {slide.title}
                </h2>
                <p className="text-base sm:text-lg opacity-75 max-w-[500px] mb-8 leading-relaxed font-light">
                  {slide.text}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(slide.primary.page)}
                    className="btn btn-dark"
                  >
                    {slide.primary.label}
                  </button>
                  <button
                    onClick={() => navigate(slide.secondary.page)}
                    className="btn btn-outline"
                  >
                    {slide.secondary.label}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => show(current - 1)}
        className="absolute top-1/2 -translate-y-1/2 z-[5] w-12 h-12 text-white flex items-center justify-center hover:bg-white/10 transition border border-white/20 right-4 sm:right-6"
        aria-label="السابق"
      >
        <ChevronRight size={20} />
      </button>
      <button
        onClick={() => show(current + 1)}
        className="absolute top-1/2 -translate-y-1/2 z-[5] w-12 h-12 text-white flex items-center justify-center hover:bg-white/10 transition border border-white/20 left-4 sm:left-6"
        aria-label="التالي"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[5] flex gap-2 items-center">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => show(i)}
            aria-label={`شريحة ${i + 1}`}
            className={`h-[3px] transition-all duration-300 ${
              i === current ? 'w-8 bg-white' : 'w-4 bg-white/30'
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-8 right-6 z-[5] text-white/40 text-xs font-medium tracking-widest uppercase hidden sm:block">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </div>
  );
}
