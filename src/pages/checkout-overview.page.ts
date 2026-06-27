import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import { formatPrice, roundToCents } from '../utils/helpers';

export class CheckoutOverviewPage extends BasePage {
  private readonly pageTitle = this.page.locator('.title');
  private readonly orderItems = this.page.locator('.cart_item');
  private readonly itemNames = this.page.locator('.inventory_item_name');
  private readonly itemSubtotalLabel = this.page.locator('.summary_subtotal_label');
  private readonly taxLabel = this.page.locator('.summary_tax_label');
  private readonly totalLabel = this.page.locator('.summary_total_label');
  private readonly finishButton = this.page.locator('[data-test="finish"]');
  private readonly cancelButton = this.page.locator('[data-test="cancel"]');

  constructor(page: Page) {
    super(page);
  }

  async getItemSubtotal(): Promise<number> {
    const text = await this.itemSubtotalLabel.innerText();
    return formatPrice(text.replace('Item total: ', ''));
  }

  async getTax(): Promise<number> {
    const text = await this.taxLabel.innerText();
    return formatPrice(text.replace('Tax: ', ''));
  }

  async getOrderTotal(): Promise<number> {
    const text = await this.totalLabel.innerText();
    return formatPrice(text.replace('Total: ', ''));
  }

  async getOrderedItemCount(): Promise<number> {
    return this.orderItems.count();
  }

  async getOrderedItemNames(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async cancelOrder(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectPageVisible(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Checkout: Overview');
    await expect(this.finishButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }

  async expectTotalsAreCorrect(): Promise<void> {
    const subtotal = await this.getItemSubtotal();
    const tax = await this.getTax();
    const total = await this.getOrderTotal();
    expect(roundToCents(total)).toBe(roundToCents(subtotal + tax));
  }
}
