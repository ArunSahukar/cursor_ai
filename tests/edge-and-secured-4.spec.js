const { test, expect } = require("@playwright/test");
const testData = require("../test-data/edge-security-test-data.json");

test.describe("Edge and Secured test case validation", () => {
  test("TC_EDGE_004 - checkout with expired debit card", async ({ page }) => {
    const edgeData = testData.edgeTestCase4;
    const baseUrl = edgeData.testData.baseUrl;
    const email = process.env[edgeData.testData.emailEnvKey];
    const password = process.env[edgeData.testData.passwordEnvKey];

    if (!email || !password) {
      throw new Error("AMAZON_EMAIL and AMAZON_PASSWORD must be set in environment variables.");
    }

    // Login flow
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.locator("#nav-link-accountList").click();
    await page.locator("#ap_email").fill(email);
    await page.locator("#continue").click();
    await page.locator("#ap_password").fill(password);
    await page.locator("#signInSubmit").click();
    await expect(page.locator("#nav-link-accountList")).toBeVisible();

    // Product search and add to cart flow
    await page.locator("#twotabsearchtextbox").fill(edgeData.testData.searchKeyword);
    await page.locator("#nav-search-submit-button").click();
    await page.locator('div[data-component-type="s-search-result"] h2 a').first().click();
    await page.locator("#add-to-cart-button").click();
    await page.locator("#nav-cart").click();
    await page.locator('input[name="proceedToRetailCheckout"]').click();

    // Edge validation point: submit expired card details at payment step
    await expect(page.locator("body")).toContainText(/payment|card|debit/i);
    const cardNumber = page.locator('input[name="addCreditCardNumber"], #addCreditCardNumber');
    const expiryMonth = page.locator('select[name="ppw-expirationDate_month"], #ppw-expirationDate_month');
    const expiryYear = page.locator('select[name="ppw-expirationDate_year"], #ppw-expirationDate_year');
    const cvv = page.locator('input[name="ppw-widgetEvent:AddCreditCardEvent"], input[name="addCreditCardVerificationNumber"], #addCreditCardVerificationNumber');
    if (await cardNumber.first().isVisible()) {
      await cardNumber.first().fill(edgeData.testData.cardNumber);
      await expiryMonth.first().selectOption(edgeData.testData.expiryMonth);
      await expiryYear.first().selectOption(edgeData.testData.expiryYear);
      if (await cvv.first().isVisible()) {
        await cvv.first().fill(edgeData.testData.cvv);
      }
      await page.locator('input[name="ppw-widgetEvent:AddCreditCardEvent"], input.a-button-input[type="submit"]').first().click();
    }

    await expect(page.locator("body")).toContainText(new RegExp(edgeData.testData.paymentErrorPattern, "i"));

    // Logout flow
    await page.goto(`${baseUrl}/gp/css/homepage.html`);
    await page.locator("#nav-link-accountList").hover();
    await page.locator("#nav-item-signout").click();
    await expect(page).toHaveURL(/signin|ap\/signin/i);
  });

  test("TC_SEC_004 - unauthorized order history direct URL access", async ({ page }) => {
    const securedData = testData.securedTestCase4;
    const baseUrl = securedData.testData.baseUrl;
    const email = process.env[securedData.testData.emailEnvKey];
    const password = process.env[securedData.testData.passwordEnvKey];

    if (!email || !password) {
      throw new Error("AMAZON_EMAIL and AMAZON_PASSWORD must be set in environment variables.");
    }

    // Login flow
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.locator("#nav-link-accountList").click();
    await page.locator("#ap_email").fill(email);
    await page.locator("#continue").click();
    await page.locator("#ap_password").fill(password);
    await page.locator("#signInSubmit").click();
    await expect(page.locator("#nav-link-accountList")).toBeVisible();

    // Logout flow
    await page.locator("#nav-link-accountList").hover();
    await page.locator("#nav-item-signout").click();
    await expect(page).toHaveURL(/signin|ap\/signin/i);

    // Security validation point: direct URL access after logout
    await page.goto(`${baseUrl}${securedData.testData.unauthorizedOrderHistoryUrl}`);
    await expect(page).toHaveURL(new RegExp(securedData.testData.expectedRedirectUrlContains, "i"));
  });
});
