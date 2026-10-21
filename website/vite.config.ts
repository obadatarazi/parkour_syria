import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parkourMetaPlugin(): Plugin {
  const arPath = fileURLToPath(new URL('./src/locales/ar.json', import.meta.url));
  const ar = JSON.parse(readFileSync(arPath, 'utf-8')) as {
    brand: { name: string };
    meta: {
      siteTitle: string;
      description: string;
      ogDescription: string;
    };
  };

  const replacements: Record<string, string> = {
    '%PS_SITE_TITLE%': escapeHtmlAttr(ar.meta.siteTitle),
    '%PS_DESCRIPTION%': escapeHtmlAttr(ar.meta.description),
    '%PS_OG_DESCRIPTION%': escapeHtmlAttr(ar.meta.ogDescription),
    '%PS_BRAND%': escapeHtmlAttr(ar.brand.name),
  };

  return {
    name: 'parkour-meta',
    transformIndexHtml(html) {
      let out = html;
      for (const [token, value] of Object.entries(replacements)) {
        out = out.split(token).join(value);
      }
      return out;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  // The site is served from cupcoding.com/parkour/
  base: '/parkour/',
  plugins: [react(), parkourMetaPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
