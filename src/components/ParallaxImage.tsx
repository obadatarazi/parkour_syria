import { useEffect, useRef, type ReactNode } from 'react';

export function ParallaxImage({
  src,
  alt,
  className = '',
  ratio = '16/9',
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  ratio?: string;
  children?: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    let rafId: number;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.bottom < 0 || rect.top > windowHeight) return;

        const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const offset = (progress - 0.5) * 60;
        img.style.transform = `translateY(${offset}px) scale(1.12)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        className="cinematic-img"
        style={{ position: 'absolute', inset: 0, transform: 'scale(1.12)' }}
      />
      {children}
    </div>
  );
}
