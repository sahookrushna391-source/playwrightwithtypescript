import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import { formatPrice } from '../utils/helpers';

export class ProductDetailPage extends BasePage {
  private readonly productName = this.page.locator('.inventory_details_name');
  private readonly productDescription = this.page.locator('.inventory_details_desc');
  private readonly productPrice = this.page.locator('.inventory_details_price');
  private readonly productImage = this.page.locator('.inventory_details_img');
  private readonly addToCartButton = this.page.locator('[data-test^="add-to-cart"]');
  private readonly removeButton = this.page.locator('[data-test^="remove"]');
  private readonly backButton = this.page.locator('[data-test="back-to-products"]');
  private readonly cartBadge = this.page.locator('.shopping_cart_badge');

  constructor(page: Page) {
    super(page);
  }

  async getProductName(): Promise<string> {
    return this.productName.innerText();
  }

  async getProductDescription(): Promise<string> {
    return this.productDescription.innerText();
  }

  async getProductPriceText(): Promise<string> {
    return this.productPrice.innerText();
  }

  async getProductPriceNumber(): Promise<number> {
    return formatPrice(await this.getProductPriceText());
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async goBackToProducts(): Promise<void> {
    await this.backButton.click();
  }

  async getCartItemCount(): Promise<number> {
    const visible = await this.cartBadge.isVisible();
    if (!visible) return 0;
    return parseInt(await this.cartBadge.innerText(), 10);
  }

  async expectDetailPageVisible(): Promise<void> {
    await expect(this.productName).toBeVisible();
    await expect(this.productDescription).toBeVisible();
    await expect(this.productPrice).toBeVisible();
    await expect(this.productImage).toBeVisible();
  }

  async expectAddToCartVisible(): Promise<void> {
    await expect(this.addToCartButton).toBeVisible();
  }

  async expectRemoveButtonVisible(): Promise<void> {
    await expect(this.removeButton).toBeVisible();
    await expect(this.addToCartButton).not.toBeVisible();
  }
}
