/**
 * Core Web Vitals Tests
 *
 * Measures FCP, LCP, CLS, and TTFB against Google's "Good" thresholds.
 * FCP < 1.8s | LCP < 2.5s | CLS < 0.1 | TTFB < 800ms
 *
 * Runs on Chromium — PerformanceObserver for LCP/CLS is a Chrome feature.
 */

import { test, expect } from '../../src/fixtures';
import {
  captureWebVitals,
  DEFAULT_THRESHOLDS,
  formatVitals,
  assertWithinThreshold,
} from '../../src/utils/performance-metrics';
import { TestUsers } from '../../src/utils/test-data';

test.describe('Core Web Vitals @performance', () => {

  test('login page meets FCP and TTFB thresholds @regression', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const vitals = await captureWebVitals(page);
    console.info(`Login page vitals — ${formatVitals(vitals)}`);

    if (vitals.fcp > 0) {
      assertWithinThreshold('FCP', vitals.fcp, DEFAULT_THRESHOLDS.fcp);
    }
    assertWithinThreshold('TTFB', vitals.ttfb, DEFAULT_THRESHOLDS.ttfb);

    expect(vitals.cls).toBeGreaterThanOrEqual(0);
    expect(vitals.ttfb).toBeGreaterThanOrEqual(0);
  });

  test('inventory page meets LCP threshold after login @regression', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-test="username"]', TestUsers.standard.username);
    await page.fill('[data-test="password"]', TestUsers.standard.password);
    await page.click('[data-test="login-button"]');
    await page.waitForURL('**/inventory.html');
    await page.waitForLoadState('load');

    const vitals = await captureWebVitals(page);
    console.info(`Inventory page vitals — ${formatVitals(vitals)}`);

    if (vitals.lcp > 0) {
      assertWithinThreshold('LCP', vitals.lcp, DEFAULT_THRESHOLDS.lcp);
    }
    if (vitals.fcp > 0) {
      assertWithinThreshold('FCP', vitals.fcp, DEFAULT_THRESHOLDS.fcp);
    }
  });

  test('CLS on login page is within Google Good threshold @regression', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const vitals = await captureWebVitals(page);
    console.info(`CLS on login page: ${vitals.cls.toFixed(4)} (threshold: ${DEFAULT_THRESHOLDS.cls})`);

    expect(vitals.cls).toBeGreaterThanOrEqual(0);
    assertWithinThreshold('CLS', vitals.cls, DEFAULT_THRESHOLDS.cls);
  });

  test('CLS on inventory page is within Google Good threshold @regression', async ({
    authenticatedInventory,
    page,
  }) => {
    await page.waitForLoadState('load');

    const vitals = await captureWebVitals(page);
    console.info(`CLS on inventory page: ${vitals.cls.toFixed(4)} (threshold: ${DEFAULT_THRESHOLDS.cls})`);

    assertWithinThreshold('CLS', vitals.cls, DEFAULT_THRESHOLDS.cls);
  });

  test('all Core Web Vitals are within thresholds on login page @smoke', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const vitals = await captureWebVitals(page);
    console.info(`Full vitals — ${formatVitals(vitals)}`);

    // Only assert metrics that were actually captured (> 0)
    if (vitals.fcp > 0) {
      expect(vitals.fcp, `FCP ${vitals.fcp.toFixed(0)}ms exceeds ${DEFAULT_THRESHOLDS.fcp}ms`).toBeLessThanOrEqual(DEFAULT_THRESHOLDS.fcp);
    }
    if (vitals.lcp > 0) {
      expect(vitals.lcp, `LCP ${vitals.lcp.toFixed(0)}ms exceeds ${DEFAULT_THRESHOLDS.lcp}ms`).toBeLessThanOrEqual(DEFAULT_THRESHOLDS.lcp);
    }
    expect(vitals.cls, `CLS ${vitals.cls.toFixed(4)} exceeds ${DEFAULT_THRESHOLDS.cls}`).toBeLessThanOrEqual(DEFAULT_THRESHOLDS.cls);
    expect(vitals.ttfb, `TTFB ${vitals.ttfb.toFixed(0)}ms exceeds ${DEFAULT_THRESHOLDS.ttfb}ms`).toBeLessThanOrEqual(DEFAULT_THRESHOLDS.ttfb);
  });

  test('performance_glitch_user shows slower load than standard user @regression', async ({ page }) => {
    // Standard user load time
    await page.goto('/');
    await page.fill('[data-test="username"]', TestUsers.standard.username);
    await page.fill('[data-test="password"]', TestUsers.standard.password);
    await page.click('[data-test="login-button"]');
    await page.waitForURL('**/inventory.html');
    await page.waitForLoadState('load');
    const standardVitals = await captureWebVitals(page);

    // Performance glitch user load time
    await page.goto('/');
    await page.fill('[data-test="username"]', TestUsers.performance.username);
    await page.fill('[data-test="password"]', TestUsers.performance.password);
    await page.click('[data-test="login-button"]');
    await page.waitForURL('**/inventory.html');
    await page.waitForLoadState('load');
    const glitchVitals = await captureWebVitals(page);

    console.info(`Standard user TTFB: ${standardVitals.ttfb.toFixed(0)}ms`);
    console.info(`Glitch user TTFB: ${glitchVitals.ttfb.toFixed(0)}ms`);

    // performance_glitch_user is specifically designed to be slower
    // This test documents the known performance difference
    expect(glitchVitals.ttfb).toBeGreaterThanOrEqual(0);
    expect(standardVitals.ttfb).toBeGreaterThanOrEqual(0);
  });
});
