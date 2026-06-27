import { test, expect } from '../../src/fixtures';
import { SortOptions } from '../../src/types';
import {
  isSortedAscending,
  isSortedDescending,
  isSortedNumericallyAscending,
  isSortedNumericallyDescending,
} from '../../src/utils/helpers';

test.describe('Inventory - Product Listing', () => {
  test(
    'should display all 6 products on the inventory page',
    { tag: '@smoke' },
    async ({ authenticatedInventory }) => {
      const count = await authenticatedInventory.getProductCount();
      expect(count).toBe(6);
    }
  );

  test(
    'should display "Products" as the page title',
    { tag: '@smoke' },
    async ({ authenticatedInventory }) => {
      await authenticatedInventory.expectPageLoaded();
    }
  );

  test(
    'should sort products by name A to Z',
    { tag: '@regression' },
    async ({ authenticatedInventory }) => {
      await authenticatedInventory.sortBy(SortOptions.az);
      const names = await authenticatedInventory.getProductNames();
      expect(isSortedAscending(names)).toBe(true);
    }
  );

  test(
    'should sort products by name Z to A',
    { tag: '@regression' },
    async ({ authenticatedInventory }) => {
      await authenticatedInventory.sortBy(SortOptions.za);
      const names = await authenticatedInventory.getProductNames();
      expect(isSortedDescending(names)).toBe(true);
    }
  );

  test(
    'should sort products by price low to high',
    { tag: '@regression' },
    async ({ authenticatedInventory }) => {
      await authenticatedInventory.sortBy(SortOptions.lohi);
      const prices = await authenticatedInventory.getProductPrices();
      expect(isSortedNumericallyAscending(prices)).toBe(true);
    }
  );

  test(
    'should sort products by price high to low',
    { tag: '@regression' },
    async ({ authenticatedInventory }) => {
      await authenticatedInventory.sortBy(SortOptions.hilo);
      const prices = await authenticatedInventory.getProductPrices();
      expect(isSortedNumericallyDescending(prices)).toBe(true);
    }
  );

  test(
    'should add a product to the cart and show badge count of 1',
    { tag: ['@smoke', '@regression'] },
    async ({ authenticatedInventory }) => {
      const names = await authenticatedInventory.getProductNames();
      await authenticatedInventory.addProductToCart(names[0]);
      await authenticatedInventory.expectCartBadge(1);
    }
  );

  test(
    'should add multiple products and reflect the correct badge count',
    { tag: '@regression' },
    async ({ authenticatedInventory }) => {
      await authenticatedInventory.addFirstNProductsToCart(3);
      await authenticatedInventory.expectCartBadge(3);
    }
  );

  test(
    'should change the add-to-cart button to remove after adding',
    { tag: '@regression' },
    async ({ authenticatedInventory }) => {
      const names = await authenticatedInventory.getProductNames();
      await authenticatedInventory.addProductToCart(names[0]);
      const btn = authenticatedInventory.getAddToCartButton(names[0]);
      await expect(btn).toHaveText(/Remove/i);
    }
  );

  test(
    'should remove a product from the cart via the inventory page',
    { tag: '@regression' },
    async ({ authenticatedInventory }) => {
      const names = await authenticatedInventory.getProductNames();
      await authenticatedInventory.addProductToCart(names[0]);
      await authenticatedInventory.expectCartBadge(1);
      await authenticatedInventory.removeProductFromCart(names[0]);
      await authenticatedInventory.expectCartBadge(0);
    }
  );

  test(
    'should navigate to product detail page when clicking on product name',
    { tag: '@regression' },
    async ({ authenticatedInventory, productDetailPage, page }) => {
      const names = await authenticatedInventory.getProductNames();
      await authenticatedInventory.clickProductByName(names[0]);
      await expect(page).toHaveURL(/inventory-item/);
      await productDetailPage.expectDetailPageVisible();
      expect(await productDetailPage.getProductName()).toBe(names[0]);
    }
  );
});
