type ImageReplaceHoverOverlayProps = {
  label: string;
  className?: string;
};

/** Subtle dim + bottom caption shown when hovering a replaceable image control. */
export function ImageReplaceHoverOverlay({ label, className }: ImageReplaceHoverOverlayProps) {
  return (
    <span
      className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${className ?? ""}`}
    >
      <span className="absolute inset-0 bg-black/20" aria-hidden="true" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-2 pb-2 pt-8">
        <span className="text-[11px] font-medium text-white drop-shadow-sm">{label}</span>
      </span>
    </span>
  );
}
