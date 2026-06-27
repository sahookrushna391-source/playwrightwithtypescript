import { test, expect } from '../../src/fixtures';
import { TestUsers, generateCheckoutInfo } from '../../src/utils/test-data';
import { roundToCents } from '../../src/utils/helpers';

const TAX_RATE = 0.08;

test.describe('Price & Tax Integrity', () => {
  test(
    'should verify subtotal equals the sum of all individual product prices',
    { tag: ['@critical', '@regression'] },
    async ({ loginPage, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, orderConfirmationPage }) => {
      let prices: number[] = [];
      let names: string[] = [];

      await test.step('Login and collect all product prices from inventory', async () => {
        await loginPage.goto();
        await loginPage.login(TestUsers.standard);
        await inventoryPage.expectPageLoaded();
        prices = await inventoryPage.getProductPrices();
        names = await inventoryPage.getProductNames();
        expect(prices).toHaveLength(6);
      });

      await test.step('Add all 6 products to the cart', async () => {
        for (const name of names) {
          await inventoryPage.addProductToCart(name);
        }
        await inventoryPage.expectCartBadge(6);
      });

      await test.step('Proceed to checkout overview page', async () => {
        await inventoryPage.navigateToCart();
        await cartPage.proceedToCheckout();
        await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());
        await checkoutOverviewPage.expectPageVisible();
      });

      await test.step('Verify subtotal matches sum of individual product prices', async () => {
        const expectedSubtotal = roundToCents(prices.reduce((sum, p) => sum + p, 0));
        const actualSubtotal = await checkoutOverviewPage.getItemSubtotal();
        expect(roundToCents(actualSubtotal)).toBe(expectedSubtotal);
      });
    }
  );

  test(
    'should verify tax is calculated at exactly 8% of the subtotal',
    { tag: ['@critical', '@regression'] },
    async ({ loginPage, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage }) => {
      await test.step('Login and add 3 products to cart', async () => {
        await loginPage.goto();
        await loginPage.login(TestUsers.standard);
        await inventoryPage.expectPageLoaded();
        await inventoryPage.addFirstNProductsToCart(3);
      });

      await test.step('Navigate through to checkout overview', async () => {
        await inventoryPage.navigateToCart();
        await cartPage.proceedToCheckout();
        await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());
      });

      await test.step('Verify tax is 8% of the subtotal', async () => {
        const subtotal = await checkoutOverviewPage.getItemSubtotal();
        const actualTax = await checkoutOverviewPage.getTax();
        const expectedTax = roundToCents(subtotal * TAX_RATE);
        expect(roundToCents(actualTax)).toBe(expectedTax);
      });
    }
  );

  test(
    'should verify the order total equals subtotal plus tax for all 6 products',
    { tag: ['@critical', '@regression'] },
    async ({ loginPage, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, orderConfirmationPage }) => {
      await test.step('Login and add all 6 products to cart', async () => {
        await loginPage.goto();
        await loginPage.login(TestUsers.standard);
        await inventoryPage.addFirstNProductsToCart(6);
      });

      await test.step('Proceed to checkout overview', async () => {
        await inventoryPage.navigateToCart();
        await cartPage.proceedToCheckout();
        await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());
      });

      await test.step('Verify total = subtotal + tax (no hidden charges)', async () => {
        const subtotal = await checkoutOverviewPage.getItemSubtotal();
        const tax = await checkoutOverviewPage.getTax();
        const total = await checkoutOverviewPage.getOrderTotal();
        expect(roundToCents(total)).toBe(roundToCents(subtotal + tax));
      });

      await test.step('Complete the order successfully', async () => {
        await checkoutOverviewPage.finishOrder();
        await orderConfirmationPage.expectOrderConfirmed();
      });
    }
  );
});
