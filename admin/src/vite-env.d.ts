/// <reference types="vite/client" />

/** Injected from admin/package.json by Vite (`define`). */
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_MEDIA_BASE_URL?: string;
  readonly VITE_STOREFRONT_URL?: string;
  readonly VITE_USE_MOCKS?: string;
  readonly VITE_FEATURE_ECOMMERCE?: string;
  readonly VITE_FEATURE_PUBLIC_EN_LOCALE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
