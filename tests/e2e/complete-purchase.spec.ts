import { test, expect } from '../../src/fixtures';
import { TestUsers, generateCheckoutInfo } from '../../src/utils/test-data';

test.describe('End-to-End Purchase Flows', () => {
  test(
    'should complete a full purchase of a single item',
    { tag: ['@e2e', '@smoke'] },
    async ({
      loginPage,
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      orderConfirmationPage,
      page,
    }) => {
      // 1. Login
      await loginPage.goto();
      await loginPage.login(TestUsers.standard);
      await inventoryPage.expectPageLoaded();

      // 2. Add one product to cart
      const names = await inventoryPage.getProductNames();
      await inventoryPage.addProductToCart(names[0]);
      await inventoryPage.expectCartBadge(1);

      // 3. Go to cart
      await inventoryPage.navigateToCart();
      await cartPage.expectCartPageVisible();
      await cartPage.expectItemInCart(names[0]);

      // 4. Checkout step 1 — customer info
      await cartPage.proceedToCheckout();
      await checkoutInfoPage.expectPageVisible();
      await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());

      // 5. Checkout step 2 — overview
      await checkoutOverviewPage.expectPageVisible();
      await checkoutOverviewPage.expectTotalsAreCorrect();

      // 6. Finish order — confirmation page
      await checkoutOverviewPage.finishOrder();
      await expect(page).toHaveURL(/checkout-complete/);
      await orderConfirmationPage.expectOrderConfirmed();
    }
  );

  test(
    'should complete a full purchase of multiple items',
    { tag: '@e2e' },
    async ({
      loginPage,
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      orderConfirmationPage,
      page,
    }) => {
      await loginPage.goto();
      await loginPage.login(TestUsers.standard);
      await inventoryPage.expectPageLoaded();

      const addedProducts = await inventoryPage.addFirstNProductsToCart(3);
      await inventoryPage.expectCartBadge(3);

      await inventoryPage.navigateToCart();
      await cartPage.expectItemCount(3);
      for (const name of addedProducts) {
        await cartPage.expectItemInCart(name);
      }

      await cartPage.proceedToCheckout();
      await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());

      const overviewCount = await checkoutOverviewPage.getOrderedItemCount();
      expect(overviewCount).toBe(3);
      await checkoutOverviewPage.expectTotalsAreCorrect();

      await checkoutOverviewPage.finishOrder();
      await expect(page).toHaveURL(/checkout-complete/);
      await orderConfirmationPage.expectOrderConfirmed();
    }
  );

  test(
    'should cancel checkout mid-flow and return to cart with items preserved',
    { tag: '@e2e' },
    async ({ loginPage, inventoryPage, cartPage, checkoutInfoPage, page }) => {
      await loginPage.goto();
      await loginPage.login(TestUsers.standard);

      const names = await inventoryPage.getProductNames();
      await inventoryPage.addProductToCart(names[0]);
      await inventoryPage.navigateToCart();
      await cartPage.proceedToCheckout();

      await checkoutInfoPage.clickCancel();
      await expect(page).toHaveURL(/cart/);
      await cartPage.expectItemInCart(names[0]);
    }
  );

  test(
    'should navigate back to home after completing an order',
    { tag: '@e2e' },
    async ({
      loginPage,
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      orderConfirmationPage,
      page,
    }) => {
      await loginPage.goto();
      await loginPage.login(TestUsers.standard);

      const names = await inventoryPage.getProductNames();
      await inventoryPage.addProductToCart(names[0]);
      await inventoryPage.navigateToCart();
      await cartPage.proceedToCheckout();
      await checkoutInfoPage.fillAndContinue(generateCheckoutInfo());
      await checkoutOverviewPage.finishOrder();
      await orderConfirmationPage.expectOrderConfirmed();

      await orderConfirmationPage.backToHome();
      await expect(page).toHaveURL(/inventory/);
      const count = await inventoryPage.getCartItemCount();
      expect(count).toBe(0);
    }
  );
});
