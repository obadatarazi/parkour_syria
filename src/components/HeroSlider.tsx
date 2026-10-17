import { useEffect, useState, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useNav } from '@/components/nav';
import { slides } from '@/data/demo';

export function HeroSlider() {
  const { navigate } = useNav();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5500);
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
      className="relative w-full h-[60vh] sm:h-[72vh] min-h-[380px] sm:min-h-[420px] max-h-[620px] overflow-hidden bg-[#1a1a1a]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === current ? 'opacity-100 z-[2]' : 'opacity-0 z-0'
          }`}
        >
          <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/75 z-[1]" />
          <div className="relative z-[2] w-full h-full flex items-end pb-12">
            <div className="container-x text-white pb-2">
              <div className="text-xs font-bold tracking-widest opacity-85 mb-2.5 uppercase">
                {slide.cat}
              </div>
              <h2 className="text-[1.85rem] sm:text-4xl lg:text-[2.5rem] font-extrabold leading-tight max-w-[560px] mb-3">
                {slide.title}
              </h2>
              <p className="text-base opacity-90 max-w-[480px] mb-5 leading-relaxed">{slide.text}</p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => navigate(slide.primary.page)}
                  className="btn bg-white text-black border border-white hover:bg-gray-100"
                >
                  {slide.primary.label}
                </button>
                <button
                  onClick={() => navigate(slide.secondary.page)}
                  className="btn bg-transparent text-white border border-white/55 hover:bg-white/10 hover:border-white"
                >
                  {slide.secondary.label}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => show(current - 1)}
        className="absolute top-1/2 -translate-y-1/2 z-[5] w-10 h-10 bg-black/35 border border-white/25 text-white flex items-center justify-center hover:bg-black/55 transition right-4"
        aria-label="السابق"
      >
        <ChevronRight size={18} />
      </button>
      <button
        onClick={() => show(current + 1)}
        className="absolute top-1/2 -translate-y-1/2 z-[5] w-10 h-10 bg-black/35 border border-white/25 text-white flex items-center justify-center hover:bg-black/55 transition left-4"
        aria-label="التالي"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[5] flex gap-2 items-center">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => show(i)}
            aria-label={`شريحة ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === current ? 'bg-white w-[22px] rounded' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
