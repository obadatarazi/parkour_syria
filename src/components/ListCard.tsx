import type { ReactNode } from 'react';

export function ListCard({
  meta,
  title,
  image,
  children,
  onClick,
}: {
  meta: string;
  title: string;
  image?: string;
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="grid grid-cols-[100px_1fr] sm:grid-cols-[220px_1fr] gap-5 border-b border-white/8 pb-8 text-right w-full last:border-none group"
    >
      {image && (
        <div className="w-[100px] h-[70px] sm:w-[220px] sm:h-[140px] overflow-hidden relative">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="cinematic-img"
            style={{ position: 'absolute', inset: 0 }}
          />
        </div>
      )}
      <div className="flex flex-col justify-center">
        <div className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-[0.1em]">{meta}</div>
        <h3 className="text-base sm:text-xl font-bold mb-1 leading-snug text-white group-hover:text-white/80 transition-colors">
          {title}
        </h3>
        {children && <div className="text-sm text-white/50 line-clamp-2">{children}</div>}
      </div>
    </button>
  );
}
