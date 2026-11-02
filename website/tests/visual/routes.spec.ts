import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const demoPath = join(__dirname, '../../src/data/demo.ts');
const demoSource = readFileSync(demoPath, 'utf8');

if (!demoSource.includes("id: 'tishreen-park'")) {
  throw new Error('demo.ts is missing id tishreen-park — aborting visual suite');
}
if (!demoSource.includes("id: 'safety-rules'")) {
  throw new Error('demo.ts is missing id safety-rules — aborting visual suite');
}

const WIDTHS = [375, 768, 1024, 1440, 1920] as const;

/** Paths relative to Vite base (/parkour). */
const ROUTES: { name: string; path: string }[] = [
  { name: 'home', path: '/' },
  { name: 'what', path: '/what-is-parkour' },
  { name: 'path', path: '/path' },
  { name: 'lesson-1', path: '/path/1' },
  { name: 'directory', path: '/directory' },
  { name: 'dir-tishreen', path: '/directory/tishreen-park' },
  { name: 'events', path: '/events' },
  { name: 'suggest', path: '/suggest' },
  { name: 'blog', path: '/blog' },
  { name: 'article-safety', path: '/blog/safety-rules' },
  { name: 'book', path: '/book' },
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
  { name: 'disclaimer', path: '/disclaimer' },
];

const FREEZE_CSS = `
  *, *::before, *::after {
    animation: none !important;
    animation-delay: 0s !important;
    transition: none !important;
    caret-color: transparent !important;
  }
  .reveal, .reveal-scale, .reveal-jump, .reveal-clip, .stagger > * {
    opacity: 1 !important;
    transform: none !important;
    clip-path: none !important;
  }
  .custom-cursor, .cursor-trail { display: none !important; }
`;

async function preparePage(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 900 });
  // Skip Preloader without changing production code (same path as a returning visitor).
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('ps-preloader-seen', '1');
    } catch {
      // ignore
    }
    // Neutralize long timers (HeroSlider 6s) for this document only.
    const nativeSetInterval = window.setInterval.bind(window);
    window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
      if (typeof timeout === 'number' && timeout >= 1000) {
        return 0 as unknown as number;
      }
      return nativeSetInterval(handler as TimerHandler, timeout as number, ...(args as []));
    }) as typeof setInterval;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.mouse.move(0, 0);
  // Stay well under the 6s hero interval; CSS animations are already frozen.
  await page.waitForTimeout(250);
}

test.describe('visual baseline', () => {
  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      test(`${route.name}@${width}`, async ({ page }) => {
        await preparePage(page, route.path, width);
        await expect(page).toHaveScreenshot(`${route.name}-${width}.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.001,
          animations: 'disabled',
        });
      });
    }
  }

  test('menu-open@375', async ({ page }) => {
    await preparePage(page, '/', 375);
    await page.getByRole('button', { name: /القائمة|menu/i }).click();
    await page.waitForTimeout(200);
    await expect(page).toHaveScreenshot('menu-open-375.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
    });
  });
});
