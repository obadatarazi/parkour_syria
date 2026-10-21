function normalizeApiUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Reads typed environment variables for the admin application.
 * Backend integration will use these flags without changing feature code.
 */
export const env = {
  apiUrl: normalizeApiUrl(import.meta.env.VITE_API_URL ?? "/api"),
  useMocks: import.meta.env.VITE_USE_MOCKS === "true",
  /** The public Parkour Syria site, for "view on website" links. */
  storefrontUrl: (import.meta.env.VITE_STOREFRONT_URL ?? "https://parkoursyria.com").replace(
    /\/+$/,
    "",
  ),
  features: {
    /**
     * The dormant shop (products, brands, orders, ...). Mirrors the backend FEATURE_ECOMMERCE:
     * while off, its routes and nav items are not registered at all.
     */
    ecommerce: import.meta.env.VITE_FEATURE_ECOMMERCE === "true",
    /** The public site's English locale. The dashboard itself always offers both languages. */
    publicEnLocale: import.meta.env.VITE_FEATURE_PUBLIC_EN_LOCALE === "true",
  },
} as const;
