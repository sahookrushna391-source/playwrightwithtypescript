import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import { formatPrice } from '../utils/helpers';

export class CartPage extends BasePage {
  private readonly pageTitle = this.page.locator('.title');
  private readonly cartItems = this.page.locator('.cart_item');
  private readonly itemNames = this.page.locator('.inventory_item_name');
  private readonly itemPrices = this.page.locator('.inventory_item_price');
  private readonly itemQuantities = this.page.locator('.cart_quantity');
  private readonly checkoutButton = this.page.locator('[data-test="checkout"]');
  private readonly continueShoppingButton = this.page.locator('[data-test="continue-shopping"]');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/cart.html');
    await this.waitForPageLoad();
  }

  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getItemNames(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  async getItemPrices(): Promise<number[]> {
    const texts = await this.itemPrices.allInnerTexts();
    return texts.map(formatPrice);
  }

  async getItemQuantities(): Promise<number[]> {
    const texts = await this.itemQuantities.allInnerTexts();
    return texts.map((q) => parseInt(q, 10));
  }

  async removeItemByName(name: string): Promise<void> {
    const item = this.cartItems.filter({ hasText: name });
    await item.locator('button[data-test^="remove"]').click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async expectCartPageVisible(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Your Cart');
    await expect(this.checkoutButton).toBeVisible();
    await expect(this.continueShoppingButton).toBeVisible();
  }

  async expectItemInCart(name: string): Promise<void> {
    await expect(this.itemNames.filter({ hasText: name })).toBeVisible();
  }

  async expectItemNotInCart(name: string): Promise<void> {
    await expect(this.itemNames.filter({ hasText: name })).not.toBeVisible();
  }

  async expectCartEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }
}
