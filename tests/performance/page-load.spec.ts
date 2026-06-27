/**
 * Page Load Performance Tests
 *
 * Measures Navigation Timing API metrics against defined thresholds.
 * Runs on Chromium only — Playwright's metrics() API is Chrome-specific.
 * Uses window.performance for cross-browser-safe Navigation Timing.
 */

import { test, expect } from '../../src/fixtures';
import {
  captureNavigationTiming,
  measureActionDuration,
  assertWithinThreshold,
} from '../../src/utils/performance-metrics';
import { TestUsers } from '../../src/utils/test-data';

const THRESHOLDS = {
  pageLoad: 5000,       // 5s max for demo site (no CDN)
  domContentLoaded: 4000,
  serverResponse: 2000,
  dnsLookup: 500,
  addToCartAction: 1000,
  loginAction: 3000,
};

test.describe('Page Load Performance @performance', () => {

  test('login page loads within threshold @regression', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const timing = await captureNavigationTiming(page);

    console.info(`Login page — Load: ${timing.pageLoad.toFixed(0)}ms | DCL: ${timing.domContentLoaded.toFixed(0)}ms | Server: ${timing.serverResponse.toFixed(0)}ms`);

    assertWithinThreshold('pageLoad', timing.pageLoad, THRESHOLDS.pageLoad);
    assertWithinThreshold('domContentLoaded', timing.domContentLoaded, THRESHOLDS.domContentLoaded);
    assertWithinThreshold('serverResponse', timing.serverResponse, THRESHOLDS.serverResponse);

    expect(timing.pageLoad).toBeGreaterThan(0);
  });

  test('inventory page loads within threshold after login @regression', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-test="username"]', TestUsers.standard.username);
    await page.fill('[data-test="password"]', TestUsers.standard.password);
    await page.click('[data-test="login-button"]');
    await page.waitForURL('**/inventory.html');
    await page.waitForLoadState('load');

    const timing = await captureNavigationTiming(page);

    console.info(`Inventory page — Load: ${timing.pageLoad.toFixed(0)}ms | DCL: ${timing.domContentLoaded.toFixed(0)}ms`);

    assertWithinThreshold('pageLoad', timing.pageLoad, THRESHOLDS.pageLoad);
    assertWithinThreshold('domContentLoaded', timing.domContentLoaded, THRESHOLDS.domContentLoaded);
  });

  test('login action completes within threshold @regression', async ({ page, loginPage }) => {
    await loginPage.goto();

    const duration = await measureActionDuration(async () => {
      await loginPage.login(TestUsers.standard);
      await page.waitForURL('**/inventory.html');
    });

    console.info(`Login action duration: ${duration}ms`);
    assertWithinThreshold('loginAction', duration, THRESHOLDS.loginAction);
  });

  test('add-to-cart action completes within threshold @regression', async ({
    authenticatedInventory,
    page,
  }) => {
    const duration = await measureActionDuration(async () => {
      await authenticatedInventory.addFirstNProductsToCart(1);
      await page.waitForFunction(() => {
        const badge = document.querySelector('.shopping_cart_badge');
        return badge && badge.textContent === '1';
      });
    });

    console.info(`Add to cart duration: ${duration}ms`);
    assertWithinThreshold('addToCartAction', duration, THRESHOLDS.addToCartAction);
  });

  test('navigation timing DNS lookup is within threshold @regression', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const timing = await captureNavigationTiming(page);

    console.info(`DNS lookup: ${timing.dnsLookup.toFixed(0)}ms`);
    // DNS is cached on repeat visits — 0ms is valid
    expect(timing.dnsLookup).toBeGreaterThanOrEqual(0);
    assertWithinThreshold('dnsLookup', timing.dnsLookup, THRESHOLDS.dnsLookup);
  });

  test('page reload is faster than cold load (cache effect) @regression', async ({ page }) => {
    // Cold load
    await page.goto('/');
    await page.waitForLoadState('load');
    const coldTiming = await captureNavigationTiming(page);

    // Warm reload
    await page.reload();
    await page.waitForLoadState('load');
    const warmTiming = await captureNavigationTiming(page);

    console.info(`Cold load: ${coldTiming.pageLoad.toFixed(0)}ms | Warm reload: ${warmTiming.pageLoad.toFixed(0)}ms`);

    // Warm load should be ≤ cold load (cache benefit)
    // Allow 20% tolerance for network variance
    expect(warmTiming.pageLoad).toBeLessThanOrEqual(coldTiming.pageLoad * 1.2);
  });
});
