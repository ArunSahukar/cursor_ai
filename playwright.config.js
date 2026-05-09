const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 90 * 1000,
  expect: {
    timeout: 15 * 1000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],
  use: {
    baseURL: process.env.BASE_URL || "https://www.amazon.in",
    // trace: "on-first-retry",
    // screenshot: "only-on-failure",
    // video: "retain-on-failure",
    headless: false,
    actionTimeout: 10000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
