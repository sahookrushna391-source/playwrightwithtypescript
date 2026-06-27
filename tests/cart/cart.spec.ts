import { test, expect } from '../../src/fixtures';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ authenticatedInventory: _ }) => {
    // authenticatedInventory fixture handles login automatically
  });

  test(
    'should show an empty cart when no products are added',
    { tag: '@smoke' },
    async ({ authenticatedInventory, cartPage }) => {
      await authenticatedInventory.navigateToCart();
      await cartPage.expectCartPageVisible();
      await cartPage.expectCartEmpty();
    }
  );

  test(
    'should display added products in the cart',
    { tag: ['@smoke', '@regression'] },
    async ({ authenticatedInventory, cartPage }) => {
      const names = await authenticatedInventory.getProductNames();
      await authenticatedInventory.addProductToCart(names[0]);
      await authenticatedInventory.navigateToCart();
      await cartPage.expectItemInCart(names[0]);
    }
  );

  test(
    'should correctly reflect item count in cart',
    { tag: '@regression' },
    async ({ authenticatedInventory, cartPage }) => {
      await authenticatedInventory.addFirstNProductsToCart(3);
      await authenticatedInventory.navigateToCart();
      await cartPage.expectItemCount(3);
    }
  );

  test(
    'should remove an item from the cart',
    { tag: ['@smoke', '@regression'] },
    async ({ authenticatedInventory, cartPage }) => {
      const names = await authenticatedInventory.getProductNames();
      await authenticatedInventory.addProductToCart(names[0]);
      await authenticatedInventory.navigateToCart();
      await cartPage.removeItemByName(names[0]);
      await cartPage.expectCartEmpty();
    }
  );

  test(
    'should display correct prices for cart items',
    { tag: '@regression' },
    async ({ authenticatedInventory, cartPage }) => {
      const prices = await authenticatedInventory.getProductPrices();
      const names = await authenticatedInventory.getProductNames();
      await authenticatedInventory.addProductToCart(names[0]);
      await authenticatedInventory.navigateToCart();
      const cartPrices = await cartPage.getItemPrices();
      expect(cartPrices[0]).toBe(prices[0]);
    }
  );

  test(
    'should return to inventory when clicking continue shopping',
    { tag: '@regression' },
    async ({ authenticatedInventory, cartPage, page }) => {
      await authenticatedInventory.navigateToCart();
      await cartPage.continueShopping();
      await expect(page).toHaveURL(/inventory/);
    }
  );

  test(
    'should navigate to checkout when clicking checkout button',
    { tag: ['@smoke', '@regression'] },
    async ({ authenticatedInventory, cartPage, page }) => {
      const names = await authenticatedInventory.getProductNames();
      await authenticatedInventory.addProductToCart(names[0]);
      await authenticatedInventory.navigateToCart();
      await cartPage.proceedToCheckout();
      await expect(page).toHaveURL(/checkout-step-one/);
    }
  );

  test(
    'should remove all items and show an empty cart',
    { tag: '@regression' },
    async ({ authenticatedInventory, cartPage }) => {
      const names = await authenticatedInventory.getProductNames();
      await authenticatedInventory.addProductToCart(names[0]);
      await authenticatedInventory.addProductToCart(names[1]);
      await authenticatedInventory.navigateToCart();
      await cartPage.removeItemByName(names[0]);
      await cartPage.removeItemByName(names[1]);
      await cartPage.expectCartEmpty();
    }
  );
});
