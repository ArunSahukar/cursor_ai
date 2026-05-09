const { test, expect } = require("@playwright/test");

test("Demo Web Shop login, search camera, add first product, capture cart screenshot", async ({ page }) => {
  const baseUrl = process.env.DEMO_WEBSHOP_BASE_URL || process.env.BASE_URL || "https://demowebshop.tricentis.com";
  const email = process.env.DEMO_WEBSHOP_EMAIL || process.env.DEMO_EMAIL;
  const password = process.env.DEMO_WEBSHOP_PASSWORD || process.env.DEMO_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Demo Web Shop credentials missing. Set DEMO_WEBSHOP_EMAIL/DEMO_WEBSHOP_PASSWORD (or DEMO_EMAIL/DEMO_PASSWORD) in .env."
    );
  }

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

  // Login
  await page.getByRole("link", { name: "Log in" }).click();
  await page.locator("#Email").fill(email);
  await page.locator("#Password").fill(password);
  await page.locator('input.button-1.login-button').click();
  await expect(page.getByRole("link", { name: "Log out" })).toBeVisible();

  // Search for camera and open first result
  await page.locator("#small-searchterms").fill("camera");
  await page.locator('input.button-1.search-box-button').click();
  const firstProductLink = page.locator(".product-item .product-title a").first();
  await expect(firstProductLink).toBeVisible();
  await firstProductLink.click();

  // Add selected product to cart
  await page.locator('input[value="Add to cart"]').first().click();
  await expect(page.locator("#topcartlink .cart-qty")).toContainText(/\(\d+\)/);

  // Open cart and take screenshot
  await page.locator("#topcartlink a.ico-cart").click();
  await expect(page).toHaveURL(/cart/i);
  await page.screenshot({ path: "test-results/demowebshop-cart-screenshot.png", fullPage: true });
});
