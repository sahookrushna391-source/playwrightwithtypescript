import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import type { SortLabel } from '../types';
import { formatPrice } from '../utils/helpers';

export class InventoryPage extends BasePage {
  private readonly pageTitle = this.page.locator('.title');
  private readonly productList = this.page.locator('.inventory_list');
  private readonly productItems = this.page.locator('.inventory_item');
  private readonly sortDropdown = this.page.locator('[data-test="product-sort-container"]');
  private readonly cartBadge = this.page.locator('.shopping_cart_badge');
  private readonly cartIcon = this.page.locator('.shopping_cart_link');
  private readonly burgerMenuBtn = this.page.locator('#react-burger-menu-btn');
  private readonly logoutLink = this.page.locator('#logout_sidebar_link');
  private readonly allItemsLink = this.page.locator('#inventory_sidebar_link');
  private readonly productNames = this.page.locator('.inventory_item_name');
  private readonly productPrices = this.page.locator('.inventory_item_price');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/inventory.html');
    await this.waitForPageLoad();
  }

  async getPageTitle(): Promise<string> {
    return this.pageTitle.innerText();
  }

  async getProductCount(): Promise<number> {
    return this.productItems.count();
  }

  async getProductNames(): Promise<string[]> {
    return this.productNames.allInnerTexts();
  }

  async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.productPrices.allInnerTexts();
    return priceTexts.map(formatPrice);
  }

  async sortBy(option: SortLabel): Promise<void> {
    await this.sortDropdown.selectOption({ label: option });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async addProductToCart(productName: string): Promise<void> {
    const product = this.productItems.filter({ hasText: productName });
    await product.locator('button').click();
  }

  async removeProductFromCart(productName: string): Promise<void> {
    const product = this.productItems.filter({ hasText: productName });
    await product.locator('[data-test^="remove"]').click();
  }

  getAddToCartButton(productName: string): Locator {
    return this.productItems.filter({ hasText: productName }).locator('button');
  }

  async getCartItemCount(): Promise<number> {
    const visible = await this.cartBadge.isVisible();
    if (!visible) return 0;
    return parseInt(await this.cartBadge.innerText(), 10);
  }

  async clickProductByName(name: string): Promise<void> {
    await this.productNames.filter({ hasText: name }).click();
  }

  async navigateToCart(): Promise<void> {
    await this.cartIcon.click();
  }

  async openBurgerMenu(): Promise<void> {
    await this.burgerMenuBtn.click();
    await this.page.locator('.bm-menu-wrap').waitFor({ state: 'visible' });
  }

  async logout(): Promise<void> {
    await this.openBurgerMenu();
    await this.logoutLink.click();
  }

  async goToAllItems(): Promise<void> {
    await this.openBurgerMenu();
    await this.allItemsLink.click();
  }

  async addFirstNProductsToCart(n: number): Promise<string[]> {
    const names = await this.getProductNames();
    const toAdd = names.slice(0, n);
    for (const name of toAdd) {
      await this.addProductToCart(name);
    }
    return toAdd;
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.productList).toBeVisible();
    await expect(this.pageTitle).toHaveText('Products');
  }

  async expectCartBadge(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).not.toBeVisible();
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async resetAppState(): Promise<void> {
    await this.openBurgerMenu();
    await this.page.locator('#reset_sidebar_link').click();
    await this.page.locator('#react-burger-cross-btn').click();
    await this.page.locator('.bm-menu-wrap').waitFor({ state: 'hidden' });
  }

  async getAllCartButtonTexts(): Promise<string[]> {
    return this.page.locator('.inventory_item button').allInnerTexts();
  }

  async getProductImageSources(): Promise<string[]> {
    return this.page
      .locator('.inventory_item_img img')
      .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src') ?? ''));
  }

  async getProductPriceByName(name: string): Promise<number> {
    const item = this.productItems.filter({ hasText: name });
    const priceText = await item.locator('.inventory_item_price').innerText();
    return formatPrice(priceText);
  }
}
