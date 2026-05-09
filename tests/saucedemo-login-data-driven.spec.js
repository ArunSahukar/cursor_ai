const { test } = require("@playwright/test");
const path = require("path");
const XLSX = require("xlsx");

const excelPath = path.resolve(__dirname, "../test-data/saucedemo-login-datasets.xlsx");
const workbook = XLSX.readFile(excelPath);
const loginSheet = workbook.Sheets[workbook.SheetNames[0]];
const loginData = XLSX.utils.sheet_to_json(loginSheet, { defval: "" });

test.describe("SauceDemo login using Excel datasets", () => {
  for (const [index, row] of loginData.entries()) {
    test(`Dataset ${index + 1} - Login check for user: ${row.username || "<blank>"}`, async ({ page }) => {
      const baseUrl = process.env.SAUCEDEMO_BASE_URL || "https://www.saucedemo.com/";

      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
      await page.locator("#user-name").fill(String(row.username));
      await page.locator("#password").fill(String(row.password));
      await page.locator("#login-button").click();

      const isLoginSuccess = page.url().includes("inventory.html");
      if (isLoginSuccess) {
        console.log(`[PASS] ${row.username}: test has been passed`);
      } else {
        const errorMessage = await page
          .locator('[data-test="error"]')
          .textContent()
          .catch(() => "Login failed, but no error message was found on the page.");
        console.log(`[FAIL] ${row.username}: ${String(errorMessage).trim()}`);
      }
    });
  }
});
