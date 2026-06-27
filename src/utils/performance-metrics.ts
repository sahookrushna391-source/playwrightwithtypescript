import { Page } from '@playwright/test';
import { WebVitals, NavigationTiming, PerformanceThresholds } from '../types';

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fcp: 1800,      // Google "Good" threshold: < 1.8s
  lcp: 2500,      // Google "Good" threshold: < 2.5s
  cls: 0.1,       // Google "Good" threshold: < 0.1
  ttfb: 800,      // Google "Good" threshold: < 800ms
  pageLoad: 3000, // Internal threshold: < 3s
};

export async function captureWebVitals(page: Page): Promise<WebVitals> {
  return page.evaluate(() => {
    return new Promise<{
      fcp: number;
      lcp: number;
      cls: number;
      ttfb: number;
      fid: number;
    }>((resolve) => {
      let lcp = 0;
      let cls = 0;
      let fcp = 0;
      const fid = 0;

      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const ttfb = navEntry ? navEntry.responseStart - navEntry.requestStart : 0;

      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
      fcp = fcpEntry ? fcpEntry.startTime : 0;

      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          lcp = entries[entries.length - 1].startTime;
        }
      });

      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) {
            cls += (entry as PerformanceEntry & { value: number }).value;
          }
        }
      });

      try {
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch {
        // Observer not supported in this browser
      }

      // Give observers time to collect buffered entries
      setTimeout(() => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
        resolve({ fcp, lcp, cls, ttfb, fid });
      }, 1000);
    });
  });
}

export async function captureNavigationTiming(page: Page): Promise<NavigationTiming> {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!nav) {
      return { dnsLookup: 0, tcpConnect: 0, serverResponse: 0, domContentLoaded: 0, pageLoad: 0 };
    }
    return {
      dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
      tcpConnect: nav.connectEnd - nav.connectStart,
      serverResponse: nav.responseEnd - nav.requestStart,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      pageLoad: nav.loadEventEnd - nav.startTime,
    };
  });
}

export async function measureActionDuration(
  action: () => Promise<void>
): Promise<number> {
  const start = Date.now();
  await action();
  return Date.now() - start;
}

export function assertWithinThreshold(
  metric: string,
  actual: number,
  threshold: number
): void {
  if (actual > threshold) {
    throw new Error(
      `Performance regression — ${metric}: ${actual.toFixed(1)}ms exceeds threshold of ${threshold}ms`
    );
  }
}

export function formatVitals(vitals: WebVitals): string {
  return [
    `FCP: ${vitals.fcp.toFixed(0)}ms`,
    `LCP: ${vitals.lcp.toFixed(0)}ms`,
    `CLS: ${vitals.cls.toFixed(4)}`,
    `TTFB: ${vitals.ttfb.toFixed(0)}ms`,
  ].join(' | ');
}
