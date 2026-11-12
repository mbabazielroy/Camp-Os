import { expect, test } from "@playwright/test";

// The core promise of CampFlow: a parent email comes in, the app triages it
// and drafts a reply, and nothing goes anywhere until a human approves it.

test("signed-out visitors are sent to the login page", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("demo: paste an email, get a draft, approve it", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Explore the demo" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/email-assistant/new");
  await page.locator("#sender_name").fill("Jordan Parker");
  await page.locator('[name="sender_email"]').fill("jordan@example.com");
  await page.locator("#subject").fill("Early pickup Friday");
  await page
    .locator('[name="original_email"]')
    .fill("Hi, I need to pick up Sam at 1pm on Friday for a dentist appointment. Who do I check out with?");
  await page.getByRole("button", { name: /Categorize/ }).click();

  // Lands on the draft review page with a reply waiting for approval.
  await expect(page).toHaveURL(/\/email-assistant\/(?!new\b)[^/?]+$/);
  await expect(page.getByText("Early pickup Friday").first()).toBeVisible();
  const approve = page.getByRole("button", { name: "Approve draft" });
  await expect(approve).toBeVisible();

  await approve.click();
  await expect(page).toHaveURL(/\/email-assistant(\?.*)?$/);
});
