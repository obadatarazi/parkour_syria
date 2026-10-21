import type { ImgHTMLAttributes, VideoHTMLAttributes } from "react";

import { resolveMediaUrl } from "@/shared/lib/resolve-media-url";

type MediaImageProps = ImgHTMLAttributes<HTMLImageElement>;

export function MediaImage({ src, alt = "", ...props }: MediaImageProps) {
  const resolvedSrc = resolveMediaUrl(typeof src === "string" ? src : undefined);
  if (!resolvedSrc) return null;

  return <img src={resolvedSrc} alt={alt} {...props} />;
}

type MediaVideoProps = VideoHTMLAttributes<HTMLVideoElement>;

export function MediaVideo({ src, ...props }: MediaVideoProps) {
  const resolvedSrc = resolveMediaUrl(typeof src === "string" ? src : undefined);
  if (!resolvedSrc) return null;

  return <video src={resolvedSrc} {...props} />;
}
