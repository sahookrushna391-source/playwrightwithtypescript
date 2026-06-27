# Test Reports

This framework ships with three reporters running in parallel on every test run.

---

## 1. Playwright HTML Report

Built-in, zero config. Opens in any browser.

```bash
# Run tests then open report
npm test
npm run report:show
```

**What it shows:**
- Pass / fail / flaky status per test
- Duration per test and suite
- Full error messages and stack traces
- Screenshots captured on failure
- Video recordings on failure
- Trace viewer links for step-by-step replay

**Output folder:** `playwright-report/index.html`

---

## 2. Allure Report

Rich interactive report with suite grouping, charts, and trend history.

### Workflow

```bash
# Step 1 — run tests (writes raw JSON to allure-results/)
npm test

# Step 2 — convert results to HTML
npm run allure:generate

# Step 3 — open the report in browser
npm run allure:open
```

**One-step shortcut** (generate + serve live):
```bash
npm test && npm run allure:serve
```

### What it shows

| Section | Content |
|---------|---------|
| **Overview** | Total pass/fail/skip with pie chart |
| **Suites** | Tests grouped by `describe` block |
| **Behaviors** | Tests grouped by feature/story label |
| **Timeline** | Parallel execution visualised across workers |
| **Steps** | Every `test.step()` shown as a collapsible tree |
| **Attachments** | Screenshots and videos on failure |
| **Tags** | Filter by `@smoke`, `@regression`, `@e2e`, `@critical` |

### Output folders

| Folder | Contents |
|--------|---------|
| `allure-results/` | Raw JSON per test (input for generate) |
| `allure-report/` | Final HTML report (open `index.html`) |

Both folders are gitignored.

---

## 3. JSON Report

Machine-readable output for integration with dashboards or custom scripts.

**Output:** `test-results/results.json`

```json
{
  "suites": [...],
  "stats": {
    "expected": 59,
    "unexpected": 0,
    "flaky": 0,
    "skipped": 0
  }
}
```

---

## Failure Artifacts

When a test fails, Playwright automatically captures:

| Artifact | Location | When captured |
|----------|----------|--------------|
| Screenshot | `test-results/*/test-failed-1.png` | On failure |
| Video | `test-results/*/video.webm` | Retained on failure |
| Trace | `test-results/*/trace.zip` | On first retry |

### Replaying a Trace

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

The trace viewer shows every action, network request, DOM snapshot, and console log in a timeline.

---

## CI Artifacts

In GitHub Actions, reports are uploaded as artifacts after every run:

- `playwright-report-chromium`
- `playwright-report-firefox`
- `playwright-report-webkit`
- `test-results-<browser>` (failures only)

Download from the **Actions → Artifacts** section of the GitHub repo.
