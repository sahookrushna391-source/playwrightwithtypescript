# Framework Architecture

## Overview

This framework follows the **Page Object Model (POM)** design pattern layered on top of Playwright's built-in fixture system. Each concern has a dedicated layer — selectors never appear in tests, and tests never instantiate page objects manually.

---

## Layer Diagram

```
┌─────────────────────────────────────────────────────┐
│                   TEST SPECS                        │
│         tests/auth  tests/cart  tests/e2e ...       │
│   (describe what should happen — no selectors)      │
└────────────────────┬────────────────────────────────┘
                     │ uses
┌────────────────────▼────────────────────────────────┐
│                  FIXTURES                           │
│             src/fixtures/index.ts                   │
│  (inject page objects + handle authenticated state) │
└────────────────────┬────────────────────────────────┘
                     │ composes
┌────────────────────▼────────────────────────────────┐
│               PAGE OBJECTS                          │
│              src/pages/*.ts                         │
│  (encapsulate selectors + interactions per page)    │
└────────────────────┬────────────────────────────────┘
                     │ extends
┌────────────────────▼────────────────────────────────┐
│                 BASE PAGE                           │
│           src/pages/base.page.ts                    │
│   (shared: navigate, waitForPageLoad, screenshot)   │
└────────────────────┬────────────────────────────────┘
                     │ uses
┌────────────────────▼────────────────────────────────┐
│            UTILITIES & TYPES                        │
│   src/utils/helpers.ts   src/utils/test-data.ts    │
│              src/types/index.ts                     │
└─────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
.
├── src/
│   ├── fixtures/
│   │   └── index.ts              # Extends Playwright test with all page objects
│   ├── pages/
│   │   ├── base.page.ts          # Abstract base class
│   │   ├── login.page.ts
│   │   ├── inventory.page.ts
│   │   ├── product-detail.page.ts
│   │   ├── cart.page.ts
│   │   ├── checkout-info.page.ts
│   │   ├── checkout-overview.page.ts
│   │   └── order-confirmation.page.ts
│   ├── types/
│   │   └── index.ts              # Shared TypeScript interfaces
│   └── utils/
│       ├── helpers.ts            # Pure utility functions
│       └── test-data.ts          # Faker-backed test data factory
├── tests/
│   ├── auth/                     # Login & logout scenarios
│   ├── inventory/                # Product listing & sorting
│   ├── cart/                     # Cart operations
│   ├── checkout/                 # Checkout form & order confirmation
│   ├── e2e/                      # Full purchase flows
│   └── advanced/                 # Complex cross-feature scenarios
├── .github/workflows/
│   └── playwright.yml            # CI/CD pipeline
├── docs/                         # This documentation
├── playwright.config.ts
├── tsconfig.json
├── .eslintrc.js
└── .prettierrc
```

---

## Key Design Decisions

### 1. One Page Class = One Application Page
Each class maps to exactly one URL/view. `CheckoutOverviewPage` handles only `/checkout-step-two.html`; `OrderConfirmationPage` handles `/checkout-complete.html`. Mixing two pages into one class is a POM violation.

### 2. Selectors Only in Page Classes
Every `data-test` attribute, CSS class, and ARIA role appears only inside `src/pages/`. Tests call semantic methods like `loginPage.login(user)` — never `page.locator('[data-test="username"]')`.

### 3. Fixtures for Dependency Injection
Playwright fixtures wire up page object instances automatically. Tests declare what they need; the framework provides it:

```typescript
test('should add to cart', async ({ authenticatedInventory, cartPage }) => {
  // Both are ready to use — no setup code in the test
});
```

### 4. `authenticatedInventory` Pre-Auth Fixture
Tests that focus on post-login functionality use `authenticatedInventory` instead of manually calling `loginPage.goto()` + `loginPage.login()` in every test. This keeps test bodies focused on the scenario being tested.

### 5. Assertions Inside Page Objects (`expect*` methods)
Page objects expose assertion helpers (`expectPageLoaded`, `expectCartBadge`, `expectError`) that use Playwright's web-first assertions internally. This gives consistent retry logic without leaking assertion logic into tests.

---

## Data Flow: A Complete Test Run

```
1. Playwright picks up test file
2. Fixtures instantiate page objects (share one `page` instance)
3. authenticatedInventory fixture → navigates to "/" → logs in → waits for inventory
4. Test body calls page object methods
5. Page object methods interact with selectors, return values or assert
6. Allure + HTML + JSON reporters capture results, steps, screenshots
```
