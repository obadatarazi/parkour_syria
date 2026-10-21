import { useEffect, useRef, type ReactNode } from 'react';

type AnimationType = 'reveal' | 'reveal-scale' | 'reveal-jump' | 'reveal-clip' | 'stagger';

export function Reveal({
  children,
  type = 'reveal',
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  type?: AnimationType;
  className?: string;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`${type} ${className}`}>
      {children}
    </Tag>
  );
}
