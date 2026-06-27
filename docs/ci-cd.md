# CI/CD Pipeline

The framework ships with a GitHub Actions workflow at `.github/workflows/playwright.yml`. It runs automatically on every push and pull request.

---

## Pipeline Overview

```
push / PR
    │
    ▼
┌─────────────────────┐
│  lint-and-typecheck  │  ← fast gate (fails early, ~30s)
└────────┬────────────┘
         │ on success
    ┌────▼─────────────────────────────────────┐
    │           test (matrix)                  │
    │  chromium  │  firefox  │  webkit         │  ← all 3 run in parallel
    └────────────────────────┬─────────────────┘
                             │ on PR only
                    ┌────────▼────────┐
                    │  smoke-tests    │  ← PR gate (chromium only)
                    └─────────────────┘
```

---

## Job 1: `lint-and-typecheck`

**Runs on:** every push and PR  
**Duration:** ~30 seconds

```yaml
- name: Run ESLint
  run: npm run lint

- name: Run TypeScript type check
  run: npm run typecheck
```

Blocks the matrix jobs if lint or types fail. This keeps broken code off the test runners.

---

## Job 2: `test` (Browser Matrix)

**Runs on:** every push (needs `lint-and-typecheck`)  
**Parallel:** 3 browser × 1 runner = 3 concurrent jobs

| Browser | Playwright Project | Device |
|---------|-------------------|--------|
| `chromium` | `chromium` | Desktop Chrome |
| `firefox` | `firefox` | Desktop Firefox |
| `webkit` | `webkit` | Desktop Safari |

Each job:
1. Checks out code
2. Sets up Node 20
3. Installs dependencies (`npm ci`)
4. Installs browser binaries (`npx playwright install --with-deps <browser>`)
5. Runs all tests for that browser
6. Uploads `playwright-report-<browser>` and `test-results-<browser>` as artifacts (on failure)

---

## Job 3: `smoke-tests` (PR Gate)

**Runs on:** pull requests only (after `lint-and-typecheck`)  
**Browser:** Chromium only

```bash
npx playwright test --grep @smoke --project=chromium
```

This must pass before a PR can be merged. Smoke tests cover the critical happy paths and run in under 2 minutes.

---

## Downloading Artifacts

When a test run fails in CI:

1. Go to **GitHub → Actions → the failed run**
2. Scroll to **Artifacts** at the bottom
3. Download `playwright-report-<browser>` and extract it
4. Open `index.html` in your browser to see the full report with screenshots and traces

---

## Environment Variables in CI

The workflow does not need a `.env` file — Playwright falls back to the `BASE_URL` set in `playwright.config.ts` when the env var is absent.

To add secrets (e.g., a staging URL or credentials):

1. Go to **GitHub → Settings → Secrets and variables → Actions**
2. Add `BASE_URL` (or any other variable)
3. Reference it in the workflow:

```yaml
env:
  BASE_URL: ${{ secrets.BASE_URL }}
```

---

## Running the Same Matrix Locally

Simulate what CI does on your machine:

```bash
# Lint + typecheck gate
npm run lint && npm run typecheck

# Full matrix (sequential locally)
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Smoke gate only
npx playwright test --grep @smoke --project=chromium
```

---

## Triggering Workflows Manually

```bash
# Push triggers the full pipeline
git push origin main

# A PR triggers lint + smoke gate
gh pr create --title "..." --body "..."
```

Or use **GitHub → Actions → Run workflow** to trigger manually on any branch.
