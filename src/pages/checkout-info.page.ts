import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import type { CheckoutInfo } from '../types';

export class CheckoutInfoPage extends BasePage {
  private readonly pageTitle = this.page.locator('.title');
  private readonly firstNameInput = this.page.locator('[data-test="firstName"]');
  private readonly lastNameInput = this.page.locator('[data-test="lastName"]');
  private readonly postalCodeInput = this.page.locator('[data-test="postalCode"]');
  private readonly continueButton = this.page.locator('[data-test="continue"]');
  private readonly cancelButton = this.page.locator('[data-test="cancel"]');
  private readonly errorMessage = this.page.locator('[data-test="error"]');

  constructor(page: Page) {
    super(page);
  }

  async fillInfo(info: CheckoutInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async fillAndContinue(info: CheckoutInfo): Promise<void> {
    await this.fillInfo(info);
    await this.clickContinue();
  }

  async getErrorMessage(): Promise<string> {
    return this.errorMessage.innerText();
  }

  async expectPageVisible(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Checkout: Your Information');
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.postalCodeInput).toBeVisible();
    await expect(this.continueButton).toBeVisible();
  }

  async expectError(message?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectNoError(): Promise<void> {
    await expect(this.errorMessage).not.toBeVisible();
  }
}
