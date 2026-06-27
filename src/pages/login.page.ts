import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import type { User } from '../types';

export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.locator('[data-test="username"]');
  private readonly passwordInput = this.page.locator('[data-test="password"]');
  private readonly loginButton = this.page.locator('[data-test="login-button"]');
  private readonly errorMessage = this.page.locator('[data-test="error"]');
  private readonly errorCloseButton = this.page.locator('[data-test="error"] button');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/');
    await this.waitForPageLoad();
  }

  async login(user: User): Promise<void> {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.loginButton.click();
  }

  async loginWithCredentials(username: string, password: string): Promise<void> {
    await this.login({ username, password });
  }

  async clearAndLogin(user: User): Promise<void> {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
    await this.login(user);
  }

  async dismissError(): Promise<void> {
    await this.errorCloseButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return this.errorMessage.innerText();
  }

  async isErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }

  async expectLoginPageVisible(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async expectErrorMessage(expectedText: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }

  async expectNoError(): Promise<void> {
    await expect(this.errorMessage).not.toBeVisible();
  }
}
