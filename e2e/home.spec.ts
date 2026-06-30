import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("loads successfully and shows hero", async ({ page }) => {
    await page.goto("/es");
    await expect(page).toHaveTitle(/MarketFlow/);
    await expect(page.getByPlaceholder(/busca/i)).toBeVisible();
  });

  test("has navigation", async ({ page }) => {
    await page.goto("/es");
    await expect(page.getByRole("link", { name: /marketplace/i }).first()).toBeVisible();
  });

  test("switches to english", async ({ page }) => {
    await page.goto("/es");
    await page.getByRole("button", { name: /language/i }).click();
    await page.getByRole("menuitem", { name: /english/i }).click();
    await expect(page).toHaveURL(/\/en/);
  });
});

test.describe("Marketplace", () => {
  test("shows products", async ({ page }) => {
    await page.goto("/es/marketplace");
    await expect(page.getByRole("heading", { name: /marketplace/i })).toBeVisible();
  });

  test("filters by category", async ({ page }) => {
    await page.goto("/es/marketplace?category=wordpress-themes");
    await expect(page).toHaveURL(/category=wordpress-themes/);
  });
});

test.describe("Product detail", () => {
  test("shows product information", async ({ page }) => {
    await page.goto("/es/marketplace");
    const firstProduct = page.locator("a[href^='/es/product/']").first();
    await firstProduct.click();
    await expect(page.getByRole("button", { name: /añadir al carrito/i })).toBeVisible();
  });
});

test.describe("Auth", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/es/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
  });
});
