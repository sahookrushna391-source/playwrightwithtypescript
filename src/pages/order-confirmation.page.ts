import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class OrderConfirmationPage extends BasePage {
  private readonly confirmationHeader = this.page.locator('.complete-header');
  private readonly confirmationText = this.page.locator('.complete-text');
  private readonly confirmationImage = this.page.locator('.pony_express');
  private readonly backHomeButton = this.page.locator('[data-test="back-to-products"]');

  constructor(page: Page) {
    super(page);
  }

  async backToHome(): Promise<void> {
    await this.backHomeButton.click();
  }

  async expectOrderConfirmed(): Promise<void> {
    await expect(this.confirmationHeader).toHaveText('Thank you for your order!');
    await expect(this.confirmationText).toBeVisible();
    await expect(this.confirmationImage).toBeVisible();
    await expect(this.backHomeButton).toBeVisible();
  }
}
