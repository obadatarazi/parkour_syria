import { env } from "@/shared/lib/env";

/** Widths accepted by the storefront `/api/media` resizer. */
const STOREFRONT_MEDIA_WIDTH = 800;

/** `.bin` covers legacy imports that stored real rasters under a wrong extension. */
const RASTER_IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|jfif|bin)$/i;

/** Origin for Laravel public storage (`/storage/...`). */
export function getMediaBaseUrl(): string {
  const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL?.replace(/\/+$/, "");
  if (mediaBase) return mediaBase;

  return env.apiUrl.replace(/\/api\/?$/, "");
}

function storagePathname(url: string): string | null {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const pathname = new URL(url).pathname;
      return pathname.startsWith("/storage/") ? pathname : null;
    } catch {
      return null;
    }
  }

  const path = (url.startsWith("/") ? url : `/${url}`).split("?")[0]?.split("#")[0] ?? "";
  return path.startsWith("/storage/") ? path : null;
}

/**
 * Public `/storage/` files 404 on the API host. The website serves raster
 * images through `${storefront}/api/media`, which is the URL that actually loads.
 */
function resolveStorefrontImageUrl(pathname: string): string | null {
  if (!RASTER_IMAGE_EXT.test(pathname) || pathname.includes("..")) return null;

  const params = new URLSearchParams();
  params.set("src", pathname);
  params.set("w", String(STOREFRONT_MEDIA_WIDTH));
  return `${env.storefrontUrl}/api/media?${params.toString()}`;
}

/**
 * Normalize a Laravel media path or URL.
 * Raster `/storage/` images go through the storefront media service.
 * Other files stay on the media/API origin.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  if (url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }

  const imageUrl = storagePathname(url);
  if (imageUrl) {
    const storefrontImage = resolveStorefrontImageUrl(imageUrl);
    if (storefrontImage) return storefrontImage;
  }

  const mediaBase = getMediaBaseUrl();

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith("/storage/")) {
        return `${mediaBase}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  return `${mediaBase}${url.startsWith("/") ? url : `/${url}`}`;
}
