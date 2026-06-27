import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { ProductDetailPage } from '../pages/product-detail.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutInfoPage } from '../pages/checkout-info.page';
import { CheckoutOverviewPage } from '../pages/checkout-overview.page';
import { OrderConfirmationPage } from '../pages/order-confirmation.page';
import { TestUsers } from '../utils/test-data';

type PageFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  orderConfirmationPage: OrderConfirmationPage;
  /** Starts already logged in as the standard user, lands on the inventory page. */
  authenticatedInventory: InventoryPage;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutInfoPage: async ({ page }, use) => {
    await use(new CheckoutInfoPage(page));
  },

  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },

  orderConfirmationPage: async ({ page }, use) => {
    await use(new OrderConfirmationPage(page));
  },

  authenticatedInventory: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TestUsers.standard);
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.expectPageLoaded();
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';
