# Playwright JavaScript Framework

This folder now contains a standard JavaScript Playwright test setup with:

- `playwright.config.js` for runner configuration
- `tests/` for test specs
- `test-data/` for JSON test data
- `.env` support via `dotenv`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browsers:

```bash
npx playwright install
```

3. Create `.env` from `.env.example` and set valid credentials.

## Run tests

```bash
npm test
```

For headed mode:

```bash
npm run test:headed
```
