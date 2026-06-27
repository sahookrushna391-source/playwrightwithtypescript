# Writing Tests

## Import Convention

Always import `test` and `expect` from the custom fixtures file — never directly from `@playwright/test`. This gives you typed page objects via dependency injection.

```typescript
// ✅ Correct
import { test, expect } from '../../src/fixtures';

// ❌ Wrong — loses all custom fixtures
import { test, expect } from '@playwright/test';
```

---

## Basic Test Structure

```typescript
import { test, expect } from '../../src/fixtures';
import { TestUsers } from '../../src/utils/test-data';

test.describe('Feature Name', () => {

  test(
    'should do something meaningful',
    { tag: ['@smoke', '@regression'] },
    async ({ loginPage, inventoryPage }) => {
      await loginPage.goto();
      await loginPage.login(TestUsers.standard);
      await inventoryPage.expectPageLoaded();
      expect(await inventoryPage.getProductCount()).toBe(6);
    }
  );

});
```

---

## Available Fixtures

| Fixture | Type | Description |
|---------|------|-------------|
| `loginPage` | `LoginPage` | Login page — not navigated yet |
| `inventoryPage` | `InventoryPage` | Products page object |
| `productDetailPage` | `ProductDetailPage` | Single product view |
| `cartPage` | `CartPage` | Shopping cart |
| `checkoutInfoPage` | `CheckoutInfoPage` | Step 1 — customer info form |
| `checkoutOverviewPage` | `CheckoutOverviewPage` | Step 2 — order summary |
| `orderConfirmationPage` | `OrderConfirmationPage` | Confirmation after finish |
| `authenticatedInventory` | `InventoryPage` | **Already logged in** as standard user |

### Using `authenticatedInventory`

When your test doesn't care about the login step itself, skip the boilerplate:

```typescript
// ✅ Use this for post-login tests
test('should sort products', async ({ authenticatedInventory }) => {
  await authenticatedInventory.sortBy('Price (low to high)');
  const prices = await authenticatedInventory.getProductPrices();
  // ...
});

// ❌ Unnecessarily verbose
test('should sort products', async ({ loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.login(TestUsers.standard);
  await inventoryPage.sortBy('Price (low to high)');
  // ...
});
```

---

## Test Tags

Apply tags via the second argument to `test()`:

```typescript
test('my test', { tag: '@smoke' }, async ({ ... }) => { ... });
test('my test', { tag: ['@smoke', '@regression'] }, async ({ ... }) => { ... });
```

| Tag | When to use |
|-----|------------|
| `@smoke` | Critical happy paths — must pass on every PR |
| `@regression` | Full feature coverage — run on every merge |
| `@e2e` | Complete user journeys from login to order |
| `@critical` | Advanced business-rule validations |

Run by tag:
```bash
npx playwright test --grep @smoke
npx playwright test --grep @regression
npx playwright test --grep @e2e
```

---

## Using `test.step()` for Readable Reports

Wrap logical steps so they appear clearly in the Allure and HTML reports:

```typescript
test('should complete checkout', async ({ ... }) => {
  await test.step('Login as standard user', async () => {
    await loginPage.goto();
    await loginPage.login(TestUsers.standard);
  });

  await test.step('Add product to cart', async () => {
    const names = await inventoryPage.getProductNames();
    await inventoryPage.addProductToCart(names[0]);
  });

  await test.step('Verify item appears in cart', async () => {
    await inventoryPage.navigateToCart();
    await cartPage.expectItemInCart(names[0]);
  });
});
```

---

## Generating Dynamic Test Data

Use the built-in factory instead of hardcoding values:

```typescript
import { generateCheckoutInfo, generateInvalidUser } from '../../src/utils/test-data';

const info = generateCheckoutInfo();
// { firstName: 'James', lastName: 'Smith', postalCode: '94103' }
// Different values on every run — safe for parallel execution
```

---

## Adding a New Page Object

**1. Create `src/pages/my-new.page.ts`:**

```typescript
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class MyNewPage extends BasePage {
  private readonly heading = this.page.locator('[data-test="page-heading"]');
  private readonly submitButton = this.page.locator('[data-test="submit"]');

  constructor(page: Page) {
    super(page);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async expectPageVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }
}
```

**2. Register in `src/fixtures/index.ts`:**

```typescript
import { MyNewPage } from '../pages/my-new.page';

type PageFixtures = {
  // ... existing fixtures
  myNewPage: MyNewPage;
};

export const test = base.extend<PageFixtures>({
  // ... existing fixtures
  myNewPage: async ({ page }, use) => {
    await use(new MyNewPage(page));
  },
});
```

**3. Use it in tests:**

```typescript
test('...', async ({ myNewPage }) => {
  await myNewPage.expectPageVisible();
});
```

---

## Test Users

```typescript
import { TestUsers } from '../../src/utils/test-data';

TestUsers.standard     // standard_user — normal behaviour
TestUsers.locked       // locked_out_user — blocked from login
TestUsers.problem      // problem_user — broken images, some buttons fail
TestUsers.performance  // performance_glitch_user — slow login (~5s delay)
```
