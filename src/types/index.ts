export interface User {
  username: string;
  password: string;
}

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';
export type SortLabel =
  | 'Name (A to Z)'
  | 'Name (Z to A)'
  | 'Price (low to high)'
  | 'Price (high to low)';

export const SortOptions: Record<SortOption, SortLabel> = {
  az: 'Name (A to Z)',
  za: 'Name (Z to A)',
  lohi: 'Price (low to high)',
  hilo: 'Price (high to low)',
};

export type UserType = 'standard' | 'locked' | 'problem' | 'performance';

// ── MongoDB document types ──────────────────────────────────────────────────

export interface OrderRecord {
  orderId: string;
  username: string;
  items: OrderItem[];
  totalPrice: number;
  checkoutInfo: CheckoutInfo;
  status: 'placed' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface UserSessionRecord {
  username: string;
  loginCount: number;
  lastLogin: Date;
  cartItemCount: number;
  isActive: boolean;
}

// ── Performance metric types ────────────────────────────────────────────────

export interface WebVitals {
  fcp: number;   // First Contentful Paint (ms)
  lcp: number;   // Largest Contentful Paint (ms)
  cls: number;   // Cumulative Layout Shift (unitless score)
  ttfb: number;  // Time to First Byte (ms)
  fid: number;   // First Input Delay (ms) — 0 if not triggered
}

export interface NavigationTiming {
  dnsLookup: number;
  tcpConnect: number;
  serverResponse: number;
  domContentLoaded: number;
  pageLoad: number;
}

export interface PerformanceThresholds {
  fcp: number;
  lcp: number;
  cls: number;
  ttfb: number;
  pageLoad: number;
}
