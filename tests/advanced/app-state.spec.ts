import { test, expect } from '../../src/fixtures';

test.describe('Reset App State', () => {
  test(
    'should clear the cart badge after Reset App State',
    { tag: ['@critical', '@regression'] },
    async ({ authenticatedInventory, cartPage }) => {
      await test.step('Add 4 products to the cart', async () => {
        await authenticatedInventory.addFirstNProductsToCart(4);
        await authenticatedInventory.expectCartBadge(4);
      });

      await test.step('Trigger Reset App State from the burger menu', async () => {
        await authenticatedInventory.resetAppState();
      });

      await test.step('Verify the cart badge is completely gone', async () => {
        await authenticatedInventory.expectCartBadge(0);
      });

      await test.step('Navigate to cart and verify it is empty', async () => {
        await authenticatedInventory.navigateToCart();
        await cartPage.expectCartEmpty();
      });
    }
  );

  test(
    'should reset all product buttons back to "Add to Cart" after reset',
    { tag: ['@critical', '@regression'] },
    async ({ authenticatedInventory }) => {
      await test.step('Add all 6 products — all buttons should now say "Remove"', async () => {
        await authenticatedInventory.addFirstNProductsToCart(6);
        const buttonTexts = await authenticatedInventory.getAllCartButtonTexts();
        expect(buttonTexts.every((t) => t.toLowerCase().includes('remove'))).toBe(true);
      });

      await test.step('Trigger Reset App State', async () => {
        await authenticatedInventory.resetAppState();
      });

      await test.step('Navigate to inventory to confirm the reset rendered fresh button states', async () => {
        await authenticatedInventory.goto();
      });

      await test.step('Verify every product button now reads "Add to cart"', async () => {
        const buttonTexts = await authenticatedInventory.getAllCartButtonTexts();
        expect(buttonTexts.every((t) => t.toLowerCase().includes('add to cart'))).toBe(true);
      });
    }
  );

  test(
    'should allow adding products again immediately after a reset',
    { tag: '@regression' },
    async ({ authenticatedInventory }) => {
      await test.step('Add 3 products and then reset', async () => {
        await authenticatedInventory.addFirstNProductsToCart(3);
        await authenticatedInventory.resetAppState();
        await authenticatedInventory.expectCartBadge(0);
      });

      await test.step('Add 2 different products after reset', async () => {
        const names = await authenticatedInventory.getProductNames();
        await authenticatedInventory.addProductToCart(names[4]);
        await authenticatedInventory.addProductToCart(names[5]);
      });

      await test.step('Verify only 2 items are in the cart (not 5)', async () => {
        await authenticatedInventory.expectCartBadge(2);
      });
    }
  );
});
