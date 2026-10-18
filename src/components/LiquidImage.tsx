import { useEffect, useRef, type CSSProperties } from 'react';
import type { LiquidHandle } from '@/lib/liquid';

// An <img> that ripples like liquid under the mouse. three.js is only downloaded on the first hover.
export function LiquidImage({
  src,
  srcSet,
  sizes,
  alt,
  className,
  style,
}: {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    const host = img?.parentElement;
    if (!img || !host) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let handle: LiquidHandle | null = null;
    let inside = false;
    let disposed = false;

    const onEnter = (e: PointerEvent) => {
      inside = true;
      onMove(e);
      if (handle) {
        handle.enter();
        return;
      }
      import('@/lib/liquid').then(({ attachLiquid }) => {
        if (disposed || handle) return;
        handle = attachLiquid(img);
        if (inside) handle.enter();
      });
    };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      handle?.move((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    const onLeave = () => {
      inside = false;
      handle?.leave();
    };

    host.addEventListener('pointerenter', onEnter);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    return () => {
      disposed = true;
      host.removeEventListener('pointerenter', onEnter);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      handle?.destroy();
    };
  }, []);

  return (
    <img
      ref={imgRef}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      crossOrigin="anonymous"
      className={className}
      style={style}
    />
  );
}
