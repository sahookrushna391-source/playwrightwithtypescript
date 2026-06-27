import { test, expect } from '../../src/fixtures';
import { generateCheckoutInfo } from '../../src/utils/test-data';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ authenticatedInventory, cartPage }) => {
    const names = await authenticatedInventory.getProductNames();
    await authenticatedInventory.addProductToCart(names[0]);
    await authenticatedInventory.navigateToCart();
    await cartPage.proceedToCheckout();
  });

  test(
    'should display the checkout information form',
    { tag: '@smoke' },
    async ({ checkoutInfoPage }) => {
      await checkoutInfoPage.expectPageVisible();
    }
  );

  test(
    'should proceed to overview with valid checkout information',
    { tag: ['@smoke', '@regression'] },
    async ({ checkoutInfoPage, checkoutOverviewPage, page }) => {
      await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());
      await expect(page).toHaveURL(/checkout-step-two/);
      await checkoutOverviewPage.expectPageVisible();
    }
  );

  test(
    'should show error when first name is missing',
    { tag: '@regression' },
    async ({ checkoutInfoPage }) => {
      const info = generateCheckoutInfo();
      await checkoutInfoPage.fillInfo({ ...info, firstName: '' });
      await checkoutInfoPage.clickContinue();
      await checkoutInfoPage.expectError('First Name is required');
    }
  );

  test(
    'should show error when last name is missing',
    { tag: '@regression' },
    async ({ checkoutInfoPage }) => {
      const info = generateCheckoutInfo();
      await checkoutInfoPage.fillInfo({ ...info, lastName: '' });
      await checkoutInfoPage.clickContinue();
      await checkoutInfoPage.expectError('Last Name is required');
    }
  );

  test(
    'should show error when postal code is missing',
    { tag: '@regression' },
    async ({ checkoutInfoPage }) => {
      const info = generateCheckoutInfo();
      await checkoutInfoPage.fillInfo({ ...info, postalCode: '' });
      await checkoutInfoPage.clickContinue();
      await checkoutInfoPage.expectError('Postal Code is required');
    }
  );

  test(
    'should cancel checkout and return to cart',
    { tag: '@regression' },
    async ({ checkoutInfoPage, page }) => {
      await checkoutInfoPage.clickCancel();
      await expect(page).toHaveURL(/cart/);
    }
  );

  test(
    'should display correct item count on the overview page',
    { tag: '@regression' },
    async ({ checkoutInfoPage, checkoutOverviewPage }) => {
      await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());
      const count = await checkoutOverviewPage.getOrderedItemCount();
      expect(count).toBe(1);
    }
  );

  test(
    'should calculate totals correctly on the overview page',
    { tag: '@regression' },
    async ({ checkoutInfoPage, checkoutOverviewPage }) => {
      await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());
      await checkoutOverviewPage.expectTotalsAreCorrect();
    }
  );

  test(
    'should complete the order and show confirmation',
    { tag: ['@smoke', '@regression'] },
    async ({ checkoutInfoPage, checkoutOverviewPage, orderConfirmationPage, page }) => {
      await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());
      await checkoutOverviewPage.finishOrder();
      await expect(page).toHaveURL(/checkout-complete/);
      await orderConfirmationPage.expectOrderConfirmed();
    }
  );

  test(
    'should cancel the overview and return to inventory',
    { tag: '@regression' },
    async ({ checkoutInfoPage, checkoutOverviewPage, page }) => {
      await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());
      await checkoutOverviewPage.cancelOrder();
      await expect(page).toHaveURL(/inventory/);
    }
  );
});
