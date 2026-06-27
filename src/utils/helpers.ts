import type { Page } from '@playwright/test';

export const formatPrice = (priceText: string): number =>
  parseFloat(priceText.replace('$', '').trim());

export const isSortedAscending = (arr: string[]): boolean =>
  arr.every((val, i) => i === 0 || val >= arr[i - 1]);

export const isSortedDescending = (arr: string[]): boolean =>
  arr.every((val, i) => i === 0 || val <= arr[i - 1]);

export const isSortedNumericallyAscending = (arr: number[]): boolean =>
  arr.every((val, i) => i === 0 || val >= arr[i - 1]);

export const isSortedNumericallyDescending = (arr: number[]): boolean =>
  arr.every((val, i) => i === 0 || val <= arr[i - 1]);

export const scrollToBottom = async (page: Page): Promise<void> => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
};

export const waitForNetworkIdle = async (page: Page, timeout = 5_000): Promise<void> => {
  await page.waitForLoadState('networkidle', { timeout });
};

export const roundToCents = (value: number): number => Math.round(value * 100) / 100;
