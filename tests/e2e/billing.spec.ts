import { expect, test } from "@playwright/test";

// With no Stripe keys (demo mode, CI) billing is off and nothing is gated.
test("demo: billing shows 'Billing not configured' and the app stays writable", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Explore the demo" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/settings");
  await page.getByRole("link", { name: "Billing", exact: true }).click();
  await expect(page).toHaveURL(/\/settings\/billing$/);
  await expect(page.getByText("Billing not configured")).toBeVisible();
  await expect(page.getByRole("button", { name: "Subscribe" })).toHaveCount(0);
  await expect(page.getByText("Read-only")).toHaveCount(0);

  // Not gated: a change still goes through.
  const title = `Billing e2e task ${Date.now()}-${test.info().project.name}`;
  await page.goto("/tasks");
  await page.locator("#title").fill(title);
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByText(title)).toBeVisible();
  await expect(page).toHaveURL(/\/tasks/);
});
