const { test, expect } = require("@playwright/test");

test("Login, search iPhone 17, add first product, and capture cart screenshot", async ({ page }) => {
  const baseUrl = process.env.BASE_URL || "https://www.amazon.in";
  const email = process.env.AMAZON_EMAIL;
  const password = process.env.AMAZON_PASSWORD;

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

  // Login flow
  const signInEntryPoints = [
    page.locator("#nav-link-accountList"),
    page.locator("#nav-link-accountList-nav-line-1"),
    page.getByRole("link", { name: /sign in|hello, sign in/i })
  ];
  let clickedSignIn = false;
  for (const entryPoint of signInEntryPoints) {
    if (await entryPoint.first().isVisible().catch(() => false)) {
      await entryPoint.first().click();
      clickedSignIn = true;
      break;
    }
  }
  if (!clickedSignIn) {
    await page.goto(`${baseUrl}/ap/signin`, { waitUntil: "domcontentloaded" });
  }

  await expect(page.locator("#ap_email")).toBeVisible({ timeout: 30000 });
  await page.locator("#ap_email").fill(email);
  await page.locator("#continue").click();
  await expect(page.locator("#ap_password")).toBeVisible({ timeout: 30000 });
  await page.locator("#ap_password").fill(password);
  await page.locator("#signInSubmit").click();

  // Basic post-login validation
  await expect(page.locator("#twotabsearchtextbox")).toBeVisible({ timeout: 30000 });

  // Search and add first product to cart
  await page.locator("#twotabsearchtextbox").fill("iphone 17");
  await page.locator("#nav-search-submit-button").click();
  await page.locator('div[data-component-type="s-search-result"] h2 a').first().click();

  const addToCartButton = page.locator("#add-to-cart-button");
  await expect(addToCartButton).toBeVisible();
  await addToCartButton.click();

  // Open cart and take screenshot
  await page.locator("#nav-cart").click();
  await expect(page).toHaveURL(/cart|gp\/cart/i);
  await page.screenshot({ path: "test-results/cart-screenshot.png", fullPage: true });
});
