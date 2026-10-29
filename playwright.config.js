import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests/browser', timeout: 20000, workers: 1, use: { baseURL: 'http://127.0.0.1:5199', headless: true }, webServer: { command: 'npm run dev -- --port 5199 --strictPort', url: 'http://127.0.0.1:5199', reuseExistingServer: !process.env.CI } });

