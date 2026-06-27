import { test, expect } from '../../src/fixtures';
import { TestUsers, generateInvalidUser } from '../../src/utils/test-data';

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    'should login successfully with standard user',
    { tag: ['@smoke', '@regression'] },
    async ({ loginPage, page }) => {
      await loginPage.login(TestUsers.standard);
      await expect(page).toHaveURL(/inventory/);
    }
  );

  test(
    'should display products page after successful login',
    { tag: '@regression' },
    async ({ loginPage, inventoryPage }) => {
      await loginPage.login(TestUsers.standard);
      await inventoryPage.expectPageLoaded();
      expect(await inventoryPage.getPageTitle()).toBe('Products');
    }
  );

  test(
    'should show error for locked out user',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.login(TestUsers.locked);
      await loginPage.expectErrorMessage('Sorry, this user has been locked out');
    }
  );

  test(
    'should show error for invalid credentials',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.login(generateInvalidUser());
      await loginPage.expectErrorMessage('Username and password do not match');
    }
  );

  test(
    'should show error when username is empty',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.loginWithCredentials('', TestUsers.standard.password);
      await loginPage.expectErrorMessage('Username is required');
    }
  );

  test(
    'should show error when password is empty',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.loginWithCredentials(TestUsers.standard.username, '');
      await loginPage.expectErrorMessage('Password is required');
    }
  );

  test(
    'should dismiss error message on close',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.login(generateInvalidUser());
      await loginPage.expectErrorMessage('Username and password do not match');
      await loginPage.dismissError();
      await loginPage.expectNoError();
    }
  );

  test(
    'should logout and redirect to login page',
    { tag: ['@smoke', '@regression'] },
    async ({ loginPage, inventoryPage, page }) => {
      await loginPage.login(TestUsers.standard);
      await inventoryPage.expectPageLoaded();
      await inventoryPage.logout();
      await loginPage.expectLoginPageVisible();
      await expect(page).toHaveURL('/');
    }
  );

  test(
    'should redirect to login when accessing inventory without auth',
    { tag: '@regression' },
    async ({ page }) => {
      await page.goto('/inventory.html');
      await expect(page).toHaveURL('/');
    }
  );

  test(
    'should allow re-login after logout',
    { tag: '@regression' },
    async ({ loginPage, inventoryPage, page }) => {
      await loginPage.login(TestUsers.standard);
      await inventoryPage.logout();
      await loginPage.login(TestUsers.standard);
      await expect(page).toHaveURL(/inventory/);
    }
  );
});
