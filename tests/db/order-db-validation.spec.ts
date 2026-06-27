/**
 * MongoDB Order Validation Tests
 *
 * Demonstrates the DB validation layer pattern:
 * UI actions (purchase flow) → simulate backend persistence → assert MongoDB document integrity.
 * Uses mongodb-memory-server — no external cluster or Docker needed.
 */

import { test, expect } from '../../src/fixtures';
import { MongoDBManager } from '../../src/db/mongo-client';
import { OrderRepository } from '../../src/db/repositories/order.repository';
import { OrderRecord } from '../../src/types';
import { TestUsers, CheckoutData } from '../../src/utils/test-data';
import { Db } from 'mongodb';

test.describe('MongoDB — Order Data Validation @db', () => {
  let db: Db;
  let orderRepo: OrderRepository;

  test.beforeAll(async () => {
    db = await MongoDBManager.start('saucedemo_orders_test');
    orderRepo = new OrderRepository(db);
  });

  test.afterAll(async () => {
    await MongoDBManager.stop();
  });

  test.beforeEach(async () => {
    await orderRepo.deleteAll();
  });

  test('order record is persisted with correct fields after purchase @regression', async ({
    page,
    authenticatedInventory,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    orderConfirmationPage,
  }) => {
    // ── UI: complete purchase flow ──────────────────────────────────────────
    const addedItems = await authenticatedInventory.addFirstNProductsToCart(1);
    await authenticatedInventory.navigateToCart();
    await cartPage.proceedToCheckout();
    await checkoutInfoPage.fillAndContinue(CheckoutData.standard);

    const totalPrice = await checkoutOverviewPage.getOrderTotal();
    const items = await checkoutOverviewPage.getOrderedItemNames();

    await checkoutOverviewPage.finishOrder();
    await orderConfirmationPage.expectOrderConfirmed();

    // ── DB: simulate order persistence (mirrors real backend behaviour) ─────
    const orderId = `ORD-${Date.now()}`;
    const order: OrderRecord = {
      orderId,
      username: TestUsers.standard.username,
      items: items.map(name => ({ name, price: totalPrice / items.length, quantity: 1 })),
      totalPrice,
      checkoutInfo: CheckoutData.standard,
      status: 'placed',
      createdAt: new Date(),
    };
    await orderRepo.insert(order);

    // ── Assert: document integrity ──────────────────────────────────────────
    const saved = await orderRepo.findByOrderId(orderId);
    expect(saved, 'Order document must exist in MongoDB').not.toBeNull();
    expect(saved!.username).toBe(TestUsers.standard.username);
    expect(saved!.status).toBe('placed');
    expect(saved!.items.length).toBe(items.length);
    expect(saved!.totalPrice).toBeGreaterThan(0);
    expect(saved!.checkoutInfo.firstName).toBe(CheckoutData.standard.firstName);
    expect(saved!.createdAt).toBeInstanceOf(Date);
  });

  test('multiple orders for the same user are all retrievable @regression', async () => {
    const username = TestUsers.standard.username;

    const orders: OrderRecord[] = [
      {
        orderId: `ORD-001-${Date.now()}`,
        username,
        items: [{ name: 'Sauce Labs Backpack', price: 29.99, quantity: 1 }],
        totalPrice: 29.99,
        checkoutInfo: CheckoutData.standard,
        status: 'placed',
        createdAt: new Date(),
      },
      {
        orderId: `ORD-002-${Date.now()}`,
        username,
        items: [
          { name: 'Sauce Labs Bike Light', price: 9.99, quantity: 1 },
          { name: 'Sauce Labs Bolt T-Shirt', price: 15.99, quantity: 1 },
        ],
        totalPrice: 25.98,
        checkoutInfo: CheckoutData.standard,
        status: 'completed',
        createdAt: new Date(),
      },
    ];

    for (const order of orders) {
      await orderRepo.insert(order);
    }

    const userOrders = await orderRepo.findByUsername(username);
    expect(userOrders.length).toBe(2);
    expect(userOrders.every(o => o.username === username)).toBeTruthy();
  });

  test('order count reflects exactly one insertion @regression', async () => {
    const order: OrderRecord = {
      orderId: `ORD-COUNT-${Date.now()}`,
      username: TestUsers.standard.username,
      items: [{ name: 'Sauce Labs Fleece Jacket', price: 49.99, quantity: 1 }],
      totalPrice: 49.99,
      checkoutInfo: CheckoutData.standard,
      status: 'placed',
      createdAt: new Date(),
    };

    const beforeCount = await orderRepo.count();
    await orderRepo.insert(order);
    const afterCount = await orderRepo.count();

    expect(afterCount).toBe(beforeCount + 1);
  });

  test('order with multiple items stores all items and quantities correctly @regression', async () => {
    const orderId = `ORD-MULTI-${Date.now()}`;
    const order: OrderRecord = {
      orderId,
      username: TestUsers.standard.username,
      items: [
        { name: 'Sauce Labs Backpack', price: 29.99, quantity: 1 },
        { name: 'Sauce Labs Bike Light', price: 9.99, quantity: 2 },
        { name: 'Sauce Labs Bolt T-Shirt', price: 15.99, quantity: 1 },
      ],
      totalPrice: 65.96,
      checkoutInfo: CheckoutData.standard,
      status: 'placed',
      createdAt: new Date(),
    };

    await orderRepo.insert(order);

    const saved = await orderRepo.findByOrderId(orderId);
    expect(saved!.items.length).toBe(3);
    expect(saved!.items.find(i => i.name === 'Sauce Labs Bike Light')?.quantity).toBe(2);
    expect(saved!.totalPrice).toBeCloseTo(65.96, 2);
  });

  test('cancelled order status is correctly stored and retrieved @regression', async () => {
    const orderId = `ORD-CANCEL-${Date.now()}`;
    const order: OrderRecord = {
      orderId,
      username: TestUsers.standard.username,
      items: [{ name: 'Sauce Labs Onesie', price: 7.99, quantity: 1 }],
      totalPrice: 7.99,
      checkoutInfo: CheckoutData.standard,
      status: 'cancelled',
      createdAt: new Date(),
    };

    await orderRepo.insert(order);

    const saved = await orderRepo.findByOrderId(orderId);
    expect(saved!.status).toBe('cancelled');
  });
});
