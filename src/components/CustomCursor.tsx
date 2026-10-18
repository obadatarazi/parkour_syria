import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!cursor || !trail) return;

    if (window.matchMedia('(hover: none)').matches) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let trailX = 0;
    let trailY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const typing = !!target.closest('input, textarea, select, [contenteditable="true"]');
      const clickable = !typing && !!target.closest('a, button, label, summary, [role="button"]');
      for (const el of [cursor, trail]) {
        el.classList.toggle('hovering', clickable);
        el.classList.toggle('typing', typing);
      }
    };

    let rafId: number;
    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;

      // Soft white drop that lags behind and stretches with speed.
      const dx = mouseX - trailX;
      const dy = mouseY - trailY;
      trailX += dx * 0.1;
      trailY += dy * 0.1;
      const stretch = Math.min(Math.hypot(dx, dy) / 250, 0.6);
      const angle = Math.atan2(dy, dx);
      trail.style.transform = `translate(${trailX}px, ${trailY}px) translate(-50%, -50%) rotate(${angle}rad) scale(${1 + stretch}, ${1 - stretch * 0.5})`;
      rafId = requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <div ref={trailRef} className="cursor-trail" aria-hidden="true" />
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />
    </>
  );
}
