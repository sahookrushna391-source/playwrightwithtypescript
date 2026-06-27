/**
 * MongoDB User Session Validation Tests
 *
 * Validates the user session persistence layer:
 * Login/logout UI actions → simulate session tracking → assert MongoDB document state.
 */

import { test, expect } from '../../src/fixtures';
import { MongoDBManager } from '../../src/db/mongo-client';
import { UserSessionRepository } from '../../src/db/repositories/user-session.repository';
import { UserSessionRecord } from '../../src/types';
import { TestUsers } from '../../src/utils/test-data';
import { Db } from 'mongodb';

test.describe('MongoDB — User Session Validation @db', () => {
  let db: Db;
  let sessionRepo: UserSessionRepository;

  test.beforeAll(async () => {
    db = await MongoDBManager.start('saucedemo_sessions_test');
    sessionRepo = new UserSessionRepository(db);
  });

  test.afterAll(async () => {
    await MongoDBManager.stop();
  });

  test.beforeEach(async () => {
    await sessionRepo.deleteByUsername(TestUsers.standard.username);
  });

  test('user session is created on first login @regression', async ({ loginPage }) => {
    // ── UI: perform login ───────────────────────────────────────────────────
    await loginPage.goto();
    await loginPage.login(TestUsers.standard);

    // ── DB: simulate session creation ──────────────────────────────────────
    const session: UserSessionRecord = {
      username: TestUsers.standard.username,
      loginCount: 1,
      lastLogin: new Date(),
      cartItemCount: 0,
      isActive: true,
    };
    await sessionRepo.upsert(session);

    // ── Assert ──────────────────────────────────────────────────────────────
    const saved = await sessionRepo.findByUsername(TestUsers.standard.username);
    expect(saved, 'Session document must exist after login').not.toBeNull();
    expect(saved!.username).toBe(TestUsers.standard.username);
    expect(saved!.isActive).toBe(true);
    expect(saved!.loginCount).toBe(1);
    expect(saved!.cartItemCount).toBe(0);
  });

  test('login count increments on subsequent logins @regression', async () => {
    const username = TestUsers.standard.username;

    await sessionRepo.upsert({
      username,
      loginCount: 1,
      lastLogin: new Date(Date.now() - 86400000),
      cartItemCount: 0,
      isActive: false,
    });

    const secondLogin = new Date();
    await sessionRepo.upsert({
      username,
      loginCount: 2,
      lastLogin: secondLogin,
      cartItemCount: 0,
      isActive: true,
    });

    const saved = await sessionRepo.findByUsername(username);
    expect(saved!.loginCount).toBe(2);
    expect(saved!.isActive).toBe(true);
  });

  test('cart item count is tracked correctly in session @regression', async ({
    authenticatedInventory,
  }) => {
    const username = TestUsers.standard.username;

    await authenticatedInventory.addFirstNProductsToCart(1);
    const cartCount = await authenticatedInventory.getCartItemCount();

    await sessionRepo.upsert({
      username,
      loginCount: 1,
      lastLogin: new Date(),
      cartItemCount: cartCount,
      isActive: true,
    });

    const saved = await sessionRepo.findByUsername(username);
    expect(saved!.cartItemCount).toBe(cartCount);
    expect(saved!.cartItemCount).toBeGreaterThan(0);
  });

  test('session is marked inactive after logout @regression', async ({
    authenticatedInventory,
  }) => {
    const username = TestUsers.standard.username;

    await sessionRepo.upsert({
      username,
      loginCount: 1,
      lastLogin: new Date(),
      cartItemCount: 0,
      isActive: true,
    });

    // ── UI: perform logout ──────────────────────────────────────────────────
    await authenticatedInventory.logout();

    // ── DB: simulate session deactivation ──────────────────────────────────
    await sessionRepo.upsert({
      username,
      loginCount: 1,
      lastLogin: new Date(),
      cartItemCount: 0,
      isActive: false,
    });

    const saved = await sessionRepo.findByUsername(username);
    expect(saved!.isActive).toBe(false);
  });

  test('only one session document exists per user (upsert behaviour) @regression', async () => {
    const username = TestUsers.standard.username;

    for (let i = 1; i <= 3; i++) {
      await sessionRepo.upsert({
        username,
        loginCount: i,
        lastLogin: new Date(),
        cartItemCount: 0,
        isActive: true,
      });
    }

    const count = await sessionRepo.count();
    expect(count).toBe(1);

    const saved = await sessionRepo.findByUsername(username);
    expect(saved!.loginCount).toBe(3);
  });
});
