import { test, expect } from '../../src/fixtures';
import { TestUsers, generateCheckoutInfo } from '../../src/utils/test-data';
import { SortOptions } from '../../src/types';

test.describe('Sort & Buy — Data-Driven Purchase Flows', () => {
  test(
    'should sort by price and successfully purchase the cheapest product',
    { tag: ['@critical', '@e2e'] },
    async ({
      loginPage,
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      orderConfirmationPage,
      page,
    }) => {
      let cheapestName: string;
      let cheapestPrice: number;

      await test.step('Login', async () => {
        await loginPage.goto();
        await loginPage.login(TestUsers.standard);
        await inventoryPage.expectPageLoaded();
      });

      await test.step('Sort products by price low to high', async () => {
        await inventoryPage.sortBy(SortOptions.lohi);
      });

      await test.step('Identify the cheapest product (first in sorted list)', async () => {
        const names = await inventoryPage.getProductNames();
        const prices = await inventoryPage.getProductPrices();
        cheapestName = names[0];
        cheapestPrice = prices[0];
        expect(cheapestPrice).toBeGreaterThan(0);
      });

      await test.step(`Add the cheapest product "${cheapestName!}" to cart`, async () => {
        await inventoryPage.addProductToCart(cheapestName!);
        await inventoryPage.expectCartBadge(1);
      });

      await test.step('Navigate to cart and verify the correct product is present', async () => {
        await inventoryPage.navigateToCart();
        await cartPage.expectItemInCart(cheapestName!);
        const cartPrices = await cartPage.getItemPrices();
        expect(cartPrices[0]).toBe(cheapestPrice!);
      });

      await test.step('Complete checkout and verify price on overview', async () => {
        await cartPage.proceedToCheckout();
        await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());
        const overviewSubtotal = await checkoutOverviewPage.getItemSubtotal();
        expect(overviewSubtotal).toBe(cheapestPrice!);
      });

      await test.step('Finish the order and confirm', async () => {
        await checkoutOverviewPage.finishOrder();
        await expect(page).toHaveURL(/checkout-complete/);
        await orderConfirmationPage.expectOrderConfirmed();
      });
    }
  );

  test(
    'should sort by price and successfully purchase the most expensive product',
    { tag: ['@critical', '@e2e'] },
    async ({
      loginPage,
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      orderConfirmationPage,
      page,
    }) => {
      let expensiveName: string;
      let expensivePrice: number;

      await test.step('Login', async () => {
        await loginPage.goto();
        await loginPage.login(TestUsers.standard);
        await inventoryPage.expectPageLoaded();
      });

      await test.step('Sort products by price high to low', async () => {
        await inventoryPage.sortBy(SortOptions.hilo);
      });

      await test.step('Identify the most expensive product (first in sorted list)', async () => {
        const names = await inventoryPage.getProductNames();
        const prices = await inventoryPage.getProductPrices();
        expensiveName = names[0];
        expensivePrice = prices[0];
      });

      await test.step(`Add the most expensive product "${expensiveName!}" to cart`, async () => {
        await inventoryPage.addProductToCart(expensiveName!);
      });

      await test.step('Verify the price on the checkout overview matches the product price', async () => {
        await inventoryPage.navigateToCart();
        await cartPage.proceedToCheckout();
        await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());
        const overviewSubtotal = await checkoutOverviewPage.getItemSubtotal();
        expect(overviewSubtotal).toBe(expensivePrice!);
      });

      await test.step('Finish the order', async () => {
        await checkoutOverviewPage.finishOrder();
        await expect(page).toHaveURL(/checkout-complete/);
        await orderConfirmationPage.expectOrderConfirmed();
      });
    }
  );

  test(
    'should verify cheapest product is always less expensive than the most expensive',
    { tag: '@regression' },
    async ({ loginPage, inventoryPage }) => {
      await test.step('Login', async () => {
        await loginPage.goto();
        await loginPage.login(TestUsers.standard);
      });

      await test.step('Get min price (sorted low to high)', async () => {
        await inventoryPage.sortBy(SortOptions.lohi);
      });

      await test.step('Assert cheapest price is less than most expensive price', async () => {
        const prices = await inventoryPage.getProductPrices();
        const cheapest = prices[0];
        const mostExpensive = prices[prices.length - 1];
        expect(cheapest).toBeLessThan(mostExpensive);
      });
    }
  );
});
