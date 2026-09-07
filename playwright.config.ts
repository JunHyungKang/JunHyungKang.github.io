import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: 'http://127.0.0.1:7425', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
  webServer: { command: 'node scripts/serve-export.mjs', url: 'http://127.0.0.1:7425', reuseExistingServer: false },
});
