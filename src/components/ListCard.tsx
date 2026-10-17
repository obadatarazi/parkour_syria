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
      className="grid grid-cols-[120px_1fr] sm:grid-cols-[200px_1fr] gap-4 border-b border-[#e5e5e5] pb-6 text-right w-full last:border-none group"
    >
      {image && (
        <div className="w-[120px] h-[90px] sm:w-[200px] sm:h-[130px] overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div>
        <div className="text-xs text-[#888] mb-1 font-semibold uppercase tracking-wide">{meta}</div>
        <h3 className="text-base sm:text-lg font-bold mb-1 leading-snug">{title}</h3>
        {children && <div className="text-sm text-[#555] line-clamp-2">{children}</div>}
      </div>
    </button>
  );
}
