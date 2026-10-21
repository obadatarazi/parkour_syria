import { defineConfig } from '@playwright/test';

const PORT = 4177;
const BASE = `http://127.0.0.1:${PORT}/parkour`;

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 120_000,
  snapshotPathTemplate: '{testDir}/baseline/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
    },
  },
  use: {
    baseURL: BASE,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  webServer: {
    command: `npx vite --host 127.0.0.1 --port ${PORT}`,
    url: BASE + '/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
