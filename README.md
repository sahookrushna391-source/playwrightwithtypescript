# Playwright TypeScript Automation Framework

Production-grade end-to-end test automation framework built with **Playwright** and **TypeScript**, targeting the [Swag Labs](https://www.saucedemo.com) demo e-commerce application.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Playwright](https://playwright.dev/) | Browser automation engine |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe test authoring |
| [@faker-js/faker](https://fakerjs.dev/) | Dynamic test data generation |
| [dotenv](https://github.com/motdotla/dotenv) | Environment configuration |
| [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) | Code quality & formatting |
| [GitHub Actions](https://github.com/features/actions) | CI/CD with multi-browser matrix |

---

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── playwright.yml      # CI/CD pipeline (lint + multi-browser matrix + smoke gate)
├── src/
│   ├── fixtures/
│   │   └── index.ts            # Custom Playwright fixtures (POM dependency injection)
│   ├── pages/
│   │   ├── base.page.ts        # Abstract base class for all pages
│   │   ├── login.page.ts       # Login page object
│   │   ├── inventory.page.ts   # Products listing page object
│   │   ├── product-detail.page.ts
│   │   ├── cart.page.ts
│   │   ├── checkout-info.page.ts
│   │   └── checkout-overview.page.ts
│   ├── types/
│   │   └── index.ts            # Shared TypeScript interfaces & enums
│   └── utils/
│       ├── helpers.ts          # Pure utility functions
│       └── test-data.ts        # Test data factory (faker-backed)
├── tests/
│   ├── auth/
│   │   └── login.spec.ts       # Login / logout scenarios
│   ├── inventory/
│   │   └── inventory.spec.ts   # Product listing & sorting
│   ├── cart/
│   │   └── cart.spec.ts        # Shopping cart operations
│   ├── checkout/
│   │   └── checkout.spec.ts    # Checkout form & order confirmation
│   └── e2e/
│       └── complete-purchase.spec.ts  # Full happy-path & edge-case flows
├── .env.example                # Environment variable template
├── .eslintrc.js
├── .prettierrc
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9

---

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd Playwright

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npm run install:browsers

# 4. Configure environment variables
cp .env.example .env
```

---

## Running Tests

```bash
# Run all tests (all browsers)
npm test

# Run on a specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Run mobile viewports
npm run test:mobile

# Filter by tag
npm run test:smoke        # @smoke — critical happy paths
npm run test:regression   # @regression — full regression suite
npm run test:e2e          # @e2e — full end-to-end flows

# Interactive UI mode
npm run test:ui

# Debug mode (step through tests)
npm run test:debug

# Headed mode (watch the browser)
npm run test:headed
```

---

## Reports

```bash
# Open the HTML report after a test run
npm run report:show
```

Playwright generates a rich HTML report at `playwright-report/index.html` with:
- Pass / fail / flaky status per test
- Screenshots on failure
- Video recordings on failure
- Trace viewer for step-by-step replay

---

## Code Quality

```bash
# Type check
npm run typecheck

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:check
```

---

## Architecture

### Page Object Model (POM)

Each page of the application has a dedicated class in `src/pages/`. Pages extend `BasePage` which provides common helpers (`navigate`, `waitForPageLoad`, `takeScreenshot`).

### Custom Fixtures

`src/fixtures/index.ts` extends Playwright's `test` with typed page instances. Tests receive fully-constructed page objects via Playwright's dependency injection — no manual `new Page()` calls in tests.

```typescript
// In a test file — page objects injected automatically
test('should login', async ({ loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.login(TestUsers.standard);
  await inventoryPage.expectPageLoaded();
});
```

The `authenticatedInventory` fixture handles login automatically so tests focused on post-login functionality skip the auth boilerplate.

### Test Tags

| Tag | Purpose |
|-----|---------|
| `@smoke` | Critical paths — run on every PR |
| `@regression` | Full feature coverage — run nightly or on merge |
| `@e2e` | Complete purchase flows from login to confirmation |

### Dynamic Test Data

`generateCheckoutInfo()` uses Faker to produce unique first name, last name, and ZIP code per test run, preventing data collisions in parallel execution.

---

## CI/CD Pipeline

`.github/workflows/playwright.yml` runs:

1. **Lint & Type Check** — gates all other jobs
2. **Multi-browser matrix** (`chromium`, `firefox`, `webkit`) — full test suite
3. **Smoke test gate** — fast PR check on Chromium only

Failed runs upload screenshots, videos, and traces as GitHub Actions artifacts for debugging.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://www.saucedemo.com` | Application under test |
| `STANDARD_USER` | `standard_user` | Default test user |
| `USER_PASSWORD` | `secret_sauce` | Shared password |
| `HEADLESS` | `true` | Run browsers headlessly |
| `DEFAULT_TIMEOUT` | `30000` | Global test timeout (ms) |
| `NAVIGATION_TIMEOUT` | `30000` | Page navigation timeout (ms) |
