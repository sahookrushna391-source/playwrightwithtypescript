import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '.env') });

const BASE_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com';
const IS_CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 1,
  workers: IS_CI ? 4 : undefined,

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list', { printSteps: true }],
    ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: true }],
    ...(IS_CI ? ([['github']] as [['github']]) : []),
  ],

  use: {
    baseURL: BASE_URL,
    headless: process.env.HEADLESS !== 'false',

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',

    actionTimeout: 10_000,
    navigationTimeout: Number(process.env.NAVIGATION_TIMEOUT) || 30_000,

    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  outputDir: 'test-results',

  timeout: Number(process.env.DEFAULT_TIMEOUT) || 30_000,
  expect: {
    timeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
